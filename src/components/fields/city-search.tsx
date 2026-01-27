import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState, useEffect } from 'react';
import { MapPinIcon, MountainIcon } from "lucide-react"
import { searchMunicipality } from "@/api/locations";
import { PostalCode } from '@/types/municipality';


interface CitySearchProps {
  onChange: (results: PostalCodeDTO) => void;
  value?: string; // aggiunto valore iniziale
}

export type PostalCodeDTO = {
  postalCode: string;
  placeName: string;
  istatCode: string;
  provinceCode: string;
  provinceName: string,
  municipalityCode: string;
  region: string;
  lat: number;
  lng: number;
  altitude: string;
};

const CitySearch: React.FC<CitySearchProps> = ({ onChange, value }) => {
  const [query, setQuery] = useState(value || ''); // inizializza con il valore passato
  const [suggestions, setSuggestions] = useState<PostalCodeDTO[]>([]);

  // Aggiorna query se value cambia (utile quando apri il modal)
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleInputChange = async (_event: React.SyntheticEvent, value: string) => {
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await searchMunicipality(value);
        console.log('Municipality data:', response);
        const results = response.map((item: PostalCode) => ({
          postalCode: item.cap,
          placeName: item.municipality.name,
          istatCode: item.municipality.istatCode,
          provinceCode: item.municipality.provinceCode || '',
          provinceName: item.municipality.provinceName || '',
          municipalityCode: item.municipality.municipalityCode || '',
          region: item.municipality.region || '',
          lat: item.municipality.latitude,
          lng: item.municipality.longitude,
          altitude: item.municipality.altitude?.toString() || '',
        }));

        setSuggestions(results);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (_event: React.SyntheticEvent, value: PostalCodeDTO | null) => {
    if (value) {
      setQuery(value.placeName);
      onChange(value);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full">


      <Input
        type="text"
        placeholder="Cerca comune"
        value={query} // sincronizzato con il valore iniziale
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, e.target.value)}
        className="w-full"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1110 3a7 7 0 016.65 13.65z"
          />
        </svg>
      </div>
      {suggestions.length > 0 && query.length > 2 && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1">
          <ScrollArea className="h-[200px]">
            <ul className="max-h-[200px] overflow-auto">
              {suggestions.map((option, index) => (
                <li
                  key={`${option.istatCode}-${index}`}
                  className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                  onClick={() => handleSelect(null, option)}
                >
                  <div className="flex-shrink-0 mr-2">
                   <MapPinIcon className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium">{option.placeName} ({option?.postalCode})</div>
                    <div className="text-sm text-muted-foreground">
                      {option.provinceName ? `${option.provinceName}, ` : ''}{option.region}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lat: {option.lat}, Lng: {option.lng} • <MountainIcon className="size-4 inline" /> {option.altitude} m.s.l.m
                    </div>
                  </div>
                </li>
              ))}
              {suggestions.length === 0 && query.length > 2 && (
                <li className="p-2 text-muted-foreground text-center">Nessun risultato trovato.</li>
              )}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
