import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Controller, UseFormReturn } from 'react-hook-form';

import { PropertyFormValues } from "@/validators/propertySchema"


interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}

export function SurfaceStep({ form }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Superfici</h3>
      <Controller
        name="sup"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Superficie (mq)</Label>
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
        name="supCommercial"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Superficie commerciale</Label>
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
        name="supLand"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Superficie terreno</Label>
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
        name="volume"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Volume (mc)</Label>
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