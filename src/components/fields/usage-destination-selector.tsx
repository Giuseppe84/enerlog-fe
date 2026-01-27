import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { usageDestination } from "@/data/properties";
import { PropertyFormValues } from "@/validators/propertySchema";

interface UsageDestinationSelectProps {
  form: UseFormReturn<PropertyFormValues>;
  name?: "usageDestination"; // campo del form
  label?: string;
}

export function UsageDestinationSelect({
  form,
  name = "usageDestination",
  label = "Destinazione d’uso",
}: UsageDestinationSelectProps) {
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
              <SelectValue placeholder="Seleziona destinazione d’uso" />
            </SelectTrigger>

            <SelectContent>
              {usageDestination.map(dest => (
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