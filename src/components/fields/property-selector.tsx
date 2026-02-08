import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fetchProperties } from "@/api/properties";
import { Property } from "@/types/property";
import { Subject } from "@/types/subject";

interface PropertySelectorProps {
  onSelectProperty: (property: Property) => void;
  subject?: Subject;
  skipCloseOnSelect?: boolean;
}

function highlight(text: string, search: string) {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 dark:bg-yellow-500/30 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  onSelectProperty,
  subject
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchProperties().then(res => setProperties(res.data));
  }, []);

  const filtered = properties.filter(s => {
    const searchable = `
      ${s.address ?? ""}
      ${s.city ?? ""}
    `.toLowerCase();

    return searchable.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cerca per nome, azienda, CF o P.IVA..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <ScrollArea className="h-[320px] border rounded-md">
        {subject && <p>Soggetti associati al soggetto {subject.companyName} {subject.firstName} {subject.lastName}</p>}
        <div className="p-2 space-y-2">
          {filtered.map(property => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="flex items-start justify-between gap-4 p-4 rounded-lg cursor-pointer
                         hover:bg-accent transition-colors border"
            >
              {/* LEFT */}
              <div className="space-y-1">
                {/* Nome principale */}



                {/* citta */}
                {property.city && (
                  <div className="text-sm text-muted-foreground">
                    CF: {highlight(property.city, search)}
                  </div>
                )}

                {property.address && (
                  <div className="text-sm text-muted-foreground">
                    P.IVA: {highlight(property.address, search)}
                  </div>
                )}


              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nessun soggetto trovato
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};