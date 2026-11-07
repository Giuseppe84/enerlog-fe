import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { cadastralCategories, CadastralCategory } from "@/data/properties";
import { PropertyFormValues } from "@/validators/propertySchema";

interface Props {
  form: UseFormReturn<PropertyFormValues>;
  index: number;
}
const GROUP_LABELS: Record<string, string> = {
  A: "Abitazioni",
  B: "Immobili collettivi",
  C: "Pertinenze",
  D: "Immobili speciali",
  E: "Immobili pubblici",
  F: "Unità senza rendita",
};

export function groupByCategory(
  categories: CadastralCategory[]
): Record<string, CadastralCategory[]> {
  return categories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<string, CadastralCategory[]>);
}

export function CadastralCategorySelect({ form, index }: Props) {
  const grouped = groupByCategory(cadastralCategories);

  return (
    <Controller
      name={`cadastralData.${index}.category`}
      control={form.control}
      render={({ field, fieldState }) => (
        <div className="space-y-1 w-full">
          <Label>Categoria catastale</Label>

          <Select
          
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Seleziona categoria" className="truncate" />
            </SelectTrigger>

            <SelectContent className="max-h-[280px]">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  {/* Header gruppo */}
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground sticky top-0 bg-background">
                    {GROUP_LABELS[group]}
                  </div>

                  {/* Voci */}
                  {items.map(cat => (
                    <SelectItem key={cat.code} value={cat.code}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {cat.code} — {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {cat.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
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