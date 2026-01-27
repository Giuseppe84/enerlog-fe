import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { buildingType } from "@/data/properties";
import { PropertyFormValues } from "@/validators/propertySchema";

interface BuildingTypeSelectProps {
  form: UseFormReturn<PropertyFormValues>;
  name?: "propertyType"; // campo del form
  label?: string;
}

export function BuildingTypeSelect({
  form,
  name = "propertyType",
  label = "Tipo di edificio",
}: BuildingTypeSelectProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>{label}</Label>

          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Seleziona il tipo di edificio" />
            </SelectTrigger>

            <SelectContent>
              {buildingType.map(dest => (
                <SelectItem key={dest.code} value={dest.code}>
                  {dest.name}
                </SelectItem>
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
  );
}