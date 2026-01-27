import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from 'react-hook-form';
import { Textarea } from "@/components/ui/textarea";
import { PropertyFormValues } from "@/validators/propertySchema"
import { UsageDestinationSelect } from "@/components/fields/usage-destination-selector"
import { BuildingTypeSelect } from "@/components/fields/building-types-selector"



interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}


export function BuildingStep({ form }: StepProps) {
  return (

    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Dati generali</h3>

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Nome</Label>
            <Input {...field} />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="notes"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Note</Label>
            <Textarea {...field} />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <UsageDestinationSelect
        form={form}
        label="Destinazione d’uso dell’immobile"
      />
      <BuildingTypeSelect
        form={form}
        label="Tipologia dell’immobile"
      />
      <Controller
        name="yearBuilt"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Anno costruzione</Label>
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
        name="renovationYear"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Anno ristrutturazione</Label>
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
        name="floors"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Piani</Label>
            <Input type="number" {...field} />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
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
          render={({ field, fieldState }) => (
            <div className="flex items-center gap-2">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              <Label>{fieldName.replace("has", "")}</Label>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      ))}
    </div>
  );
}