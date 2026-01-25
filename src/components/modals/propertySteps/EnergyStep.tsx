import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const ENERGY_CLASSES = ["A4","A3","A2","A1","B","C","D","E","F","G"];

export function EnergyStep({ form }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Controller
        name="energyClass"
        control={form.control}
        render={({ field }) => (
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
          </div>
        )}
      />

      <Controller
        name="EPglren"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>EPgl,ren</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="co2"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>CO₂</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />
    </div>
  );
}