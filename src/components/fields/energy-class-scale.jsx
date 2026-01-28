import React, { useState } from 'react';

const EnergyClassScale = () => {
  const [epgl, setEpgl] = useState(120);
  const [isNZEB, setIsNZEB] = useState(false);

  // Definizione delle classi energetiche con range e colori
  const energyClasses = [
    { class: 'A4', max: 0.40, color: '#00A550', label: 'A4', range: '≤ 0.40' },
    { class: 'A3', max: 0.60, color: '#1FB75D', label: 'A3', range: '0.40 - 0.60' },
    { class: 'A2', max: 0.80, color: '#4DC86A', label: 'A2', range: '0.60 - 0.80' },
    { class: 'A1', max: 1.00, color: '#7BD977', label: 'A1', range: '0.80 - 1.00' },
    { class: 'B', max: 1.20, color: '#C4D93B', label: 'B', range: '1.00 - 1.20' },
    { class: 'C', max: 1.50, color: '#FEED00', label: 'C', range: '1.20 - 1.50' },
    { class: 'D', max: 2.00, color: '#FDB913', label: 'D', range: '1.50 - 2.00' },
    { class: 'E', max: 2.60, color: '#F68B1F', label: 'E', range: '2.00 - 2.60' },
    { class: 'F', max: 3.50, color: '#EE5623', label: 'F', range: '2.60 - 3.50' },
    { class: 'G', max: Infinity, color: '#E20613', label: 'G', range: '> 3.50' }
  ];

  // Calcola la classe energetica in base al valore EPgl
  const getEnergyClass = (value) => {
    const epglRatio = value / 100; // Normalizziamo il valore
    return energyClasses.find(ec => epglRatio <= ec.max) || energyClasses[energyClasses.length - 1];
  };

  const currentClass = getEnergyClass(epgl);

  return (

      <div className="bg-white rounded-xl shadow-xl p-5 max-w-lg w-full">
        <h1 className="text-xl font-bold text-center mb-1 text-slate-800">
          Classe Energetica Edificio
        </h1>
        <p className="text-center text-slate-600 text-xs mb-4">
          Attestato di Prestazione Energetica (APE)
        </p>

        {/* Input per EPgl */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            EPgl - Indice di Prestazione Energetica Globale
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="400"
              value={epgl}
              onChange={(e) => setEpgl(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <input
                type="number"
                value={epgl}
                onChange={(e) => setEpgl(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm font-semibold"
              />
              <span className="text-xs text-slate-600 font-medium">kWh/m²a</span>
            </div>
          </div>
        </div>

        {/* Checkbox NZEB */}
        <div className="mb-4">
          <label className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-all">
            <input
              type="checkbox"
              checked={isNZEB}
              onChange={(e) => setIsNZEB(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-800 text-sm">NZEB</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                  Nearly Zero Energy Building
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Edificio ad energia quasi zero
              </p>
            </div>
            {isNZEB && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </label>
        </div>

        {/* Scala SVG */}
        <svg width="100%" height="350" viewBox="0 0 450 350" className="mb-4">
          {energyClasses.map((ec, index) => {
            const y = index * 32 + 10;
            const width = 340 + (index * 11);
            const isActive = ec.class === currentClass.class;
            
            return (
              <g key={ec.class}>
                {/* Barra della classe energetica */}
                <rect
                  x={450 - width}
                  y={y}
                  width={width}
                  height={28}
                  fill={ec.color}
                  opacity={isActive ? 1 : 0.4}
                  stroke={isActive ? '#1e293b' : 'transparent'}
                  strokeWidth={isActive ? 2.5 : 0}
                  rx="3"
                />
                
                {/* Label della classe */}
                <text
                  x={450 - width + 15}
                  y={y + 19}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                >
                  {ec.label}
                </text>
                
                {/* Range EPgl */}
                <text
                  x={450 - width + 60}
                  y={y + 19}
                  fill="white"
                  fontSize="11"
                  fontWeight="500"
                >
                  {ec.range} EPgl
                </text>

                {/* Indicatore freccia per la classe attiva */}
                {isActive && (
                  <>
                    <polygon
                      points={`${450 - width - 15},${y + 14} ${450 - width - 4},${y + 8} ${450 - width - 4},${y + 20}`}
                      fill="#1e293b"
                    />
                    <circle
                      cx={450 - width - 22}
                      cy={y + 14}
                      r="5"
                      fill="#1e293b"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Informazioni sulla classe corrente */}
        <div 
          className="p-4 rounded-lg text-white text-center"
          style={{ backgroundColor: currentClass.color }}
        >
          <div className="text-3xl font-bold mb-1">
            {currentClass.label}
          </div>
          <div className="text-sm font-semibold mb-0.5">
            Classe Energetica
          </div>
          <div className="text-xs opacity-90 mb-1">
            EPgl: {epgl} kWh/m²a
          </div>
          {isNZEB && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor"/>
              </svg>
              <span className="font-bold text-xs">EDIFICIO NZEB</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3"/>
                <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="mt-4 p-2.5 bg-slate-50 rounded-lg">
          <p className="text-[10px] text-slate-600 text-center leading-relaxed">
            <strong>EPgl</strong> = Indice di prestazione energetica globale non rinnovabile
            <br />
            Fabbisogno annuo di energia primaria non rinnovabile per m² di superficie
          </p>
        </div>
      </div>

  );
};

export default EnergyClassScale;
