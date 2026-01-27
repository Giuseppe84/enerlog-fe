import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from 'react-hook-form';

import {PropertyFormValues} from "@/validators/propertySchema"


interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}


const ENERGY_CLASSES = ["A4","A3","A2","A1","B","C","D","E","F","G"];

export function EnergyStep({ form }: StepProps) {
  return (
     <div className="flex flex-col gap-4">
       <h3 className="font-semibold">Dati energetici</h3>
      <Controller
        name="energyClass"
        control={form.control}
        render={({ field ,fieldState}) => (
          <div>
            <Label>Classe energetica</Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent>
                {ENERGY_CLASSES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
              {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        name="EPglren"
        control={form.control}
        render={({ field,fieldState }) => (
          <div>
            <Label>EPgl,ren</Label>
            <Input type="number" {...field} />
                {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        name="co2"
        control={form.control}
        render={({ field,fieldState }) => (
          <div>
            <Label>CO₂</Label>
            <Input type="number" {...field} />
                 {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
}