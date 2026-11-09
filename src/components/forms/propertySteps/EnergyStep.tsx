import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from 'react-hook-form';
import { PropertyFormValues } from "@/validators/propertySchema"
import React from 'react';

interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}
const ENERGY_CLASSES = ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"];

// Definizione delle classi energetiche con colori e range EPgl
const energyClassesData = [
  { class: 'A4', color: '#00A550', maxEPgl: 40 },
  { class: 'A3', color: '#1FB75D', maxEPgl: 60 },
  { class: 'A2', color: '#4DC86A', maxEPgl: 80 },
  { class: 'A1', color: '#7BD977', maxEPgl: 100 },
  { class: 'B', color: '#C4D93B', maxEPgl: 120 },
  { class: 'C', color: '#FEED00', maxEPgl: 150 },
  { class: 'D', color: '#FDB913', maxEPgl: 200 },
  { class: 'E', color: '#F68B1F', maxEPgl: 260 },
  { class: 'F', color: '#EE5623', maxEPgl: 350 },
  { class: 'G', color: '#E20613', maxEPgl: Infinity }
];

// Funzione per calcolare la classe energetica in base all'EPgl
const calculateEnergyClass = (epglValue: number): string => {
  const energyClass = energyClassesData.find(ec => epglValue <= ec.maxEPgl);
  return energyClass?.class || 'G';
};

export function EnergyStep({ form }: StepProps) {
  const currentEPglnren = form.watch("EPglnren");
  const isNZEB = form.watch("isNzeb");

  // Calcola automaticamente la classe energetica quando cambia EPglren
  React.useEffect(() => {
    if (currentEPglnren !== undefined) {
      const calculatedClass = calculateEnergyClass(currentEPglnren);
      form.setValue("energyClass", calculatedClass);
    }
  }, [currentEPglnren, form]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Dati energetici</h3>
      <Controller
        name="energyClass"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Classe energetica</Label>
              <span className="text-xs text-muted-foreground italic">
                Calcolata automaticamente da EPgl,ren
              </span>
            </div>
            <div className="flex gap-4">
              {/* Scala SVG - ora in sola visualizzazione */}
              <div className="flex-1 opacity-90">
                <svg width="100%" height="280" viewBox="0 0 350 280">
                  {energyClassesData.map((ec, index) => {
                    const y = index * 26 + 8;
                    const width = 270 + (index * 9);
                    const isActive = ec.class === field.value;

                    return (
                      <g key={ec.class}>
                        {/* Barra della classe energetica */}
                        <rect
                          x={350 - width}
                          y={y}
                          width={width}
                          height={22}
                          fill={ec.color}
                          opacity={isActive ? 1 : 0.4}
                          stroke={isActive ? '#1e293b' : 'transparent'}
                          strokeWidth={isActive ? 2.5 : 0}
                          rx="2"
                        />

                        {/* Label della classe */}
                        <text
                          x={350 - width + 12}
                          y={y + 15}
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {ec.class}
                        </text>

                        {/* Range EPgl */}
                        <text
                          x={350 - width + 45}
                          y={y + 15}
                          fill="white"
                          fontSize="10"
                          opacity="0.9"
                        >
                          ≤ {ec.maxEPgl === Infinity ? '350+' : ec.maxEPgl}
                        </text>

                        {/* Indicatore per la classe attiva */}
                        {isActive && (
                          <>
                            <polygon
                              points={`${350 - width - 12},${y + 11} ${350 - width - 3},${y + 6} ${350 - width - 3},${y + 16}`}
                              fill="#1e293b"
                            />
                            <circle
                              cx={350 - width - 18}
                              cy={y + 11}
                              r="4"
                              fill="#1e293b"
                            />
                            {/* Effetto pulsante */}
                            <animate
                              attributeName="opacity"
                              values="1;0.6;1"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Riquadro classe corrente */}
              <div className="w-24 h-30 flex flex-col items-center justify-center">
                {field.value ? (
                  <div
                    className="w-full h-full rounded-lg flex flex-col items-center justify-center text-white shadow-lg "
                    style={{
                      backgroundColor: energyClassesData.find(ec => ec.class === field.value)?.color || '#9ca3af'
                    }}
                  >
                    <div className="text-5xl font-bold mb-1">
                      {field.value}
                    </div>
                    <div className="text-xs font-medium opacity-90">
                      Classe
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-400 text-center px-2">
                      Imposta EPgl,ren
                    </span>
                  </div>
                )}
              </div>
            </div>

            {fieldState.error && (
              <p className="text-sm text-destructive mt-2">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      {/* Checkbox NZEB */}
     {currentEPglnren && currentEPglnren < 40 && <Controller
        name="isNzeb"
        control={form.control}
        render={({ field, fieldState }) => {
          // value come array per Radix Slider
          const sliderValue = field.value !== undefined ? [field.value] : [100];
          return (<div className="mb-4">
            <label className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-all">
              <input
                type="checkbox"
                checked={isNZEB}
               
                onChange={(e) => field.onChange(e.target.checked)}
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
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                  <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </label>
          </div>

          );
        }}
      />}
           <Controller
        name="EPglnren"
        control={form.control}
        render={({ field, fieldState }) => {
          // value come array per Radix Slider
          const sliderValue = field.value !== undefined ? [field.value] : [33];
          return (
            <div className="space-y-3">
                  <Label>EPgl,nren (kWh/m²a)</Label>
              <span className="text-muted-foreground text-sm">
                {field.value}
              </span>
              <Slider
                value={sliderValue}          // <-- usa array
                onValueChange={([val]) => field.onChange(val)}  // destruttura l'array
                max={400}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>400</span>
              </div>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
      <Controller
        name="EPglren"
        control={form.control}
        render={({ field, fieldState }) => {
          // value come array per Radix Slider
          const sliderValue = field.value !== undefined ? [field.value] : [100];
          return (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>EPgl,ren (kWh/m²a)</Label>
                <span className="text-muted-foreground text-sm font-semibold">
                  {field.value ?? 400}
                </span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={([val]) => field.onChange(val)}
                max={400}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>400</span>
              </div>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
  
       <Controller
        name="co2"
        control={form.control}
        render={({ field, fieldState }) => {
          // value come array per Radix Slider
          const sliderValue = field.value !== undefined ? [field.value] : [33];
          return (
            <div className="space-y-3">
              <Label>CO₂</Label>
              <span className="text-muted-foreground text-sm">
                {field.value}
              </span>
              <Slider
                value={sliderValue}          // <-- usa array
                onValueChange={([val]) => field.onChange(val)}  // destruttura l'array
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>400</span>
              </div>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
      <Controller
        name="energyConsumption"
        control={form.control}
        render={({ field, fieldState }) => {
          // value come array per Radix Slider
          const sliderValue = field.value !== undefined ? [field.value] : [33];
          return (
            <div className="space-y-3">
              <Label>EPgl,tot</Label>
              <span className="text-muted-foreground text-sm">
                {field.value}
              </span>
              <Slider
                value={sliderValue}          // <-- usa array
                onValueChange={([val]) => field.onChange(val)}  // destruttura l'array
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>400</span>
              </div>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
  
}