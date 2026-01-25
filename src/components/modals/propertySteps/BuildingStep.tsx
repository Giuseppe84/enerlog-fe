import { Input } from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

export function BuildingStep({ form }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Controller
        name="yearBuilt"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Anno costruzione</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="renovationYear"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Anno ristrutturazione</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="floors"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Piani</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      {[
        "hasElevator",
        "hasGarage",
        "hasParking",
        "hasGarden",
        "hasBalcony",
        "hasTerrace",
      ].map((fieldName) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              <Label>{fieldName.replace("has", "")}</Label>
            </div>
          )}
        />
      ))}
    </div>
  );
}