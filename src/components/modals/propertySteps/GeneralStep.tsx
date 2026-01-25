import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Property } from "@/types/property";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';


export function GeneralStep({
  data,
  onChange,
}: {
  data: Property;
  onChange: (v: Partial<Property>) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label>Nome edificio</Label>
        <Input
          value={data.name || ""}
          onChange={e => onChange({ name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipologia</Label>
          <Input
            value={data.propertyType || ""}
            onChange={e => onChange({ propertyType: e.target.value })}
          />
        </div>
        <div>
          <Label>Destinazione d’uso</Label>
          <Input
            value={data.usageDestination || ""}
            onChange={e => onChange({ usageDestination: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}