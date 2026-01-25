import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LocationStep({ form }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="address"
        control={form.control}
        render={({ field }) => (
          <div className="col-span-2">
            <Label>Indirizzo</Label>
            <Input {...field} />
          </div>
        )}
      />

      <Controller
        name="city"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Città</Label>
            <Input {...field} />
          </div>
        )}
      />

      <Controller
        name="province"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Provincia</Label>
            <Input {...field} />
          </div>
        )}
      />

      <Controller
        name="zip"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>CAP</Label>
            <Input {...field} />
          </div>
        )}
      />
    </div>
  );
}