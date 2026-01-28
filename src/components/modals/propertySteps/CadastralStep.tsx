import { Input } from "@/components/ui/input";
import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PropertyFormValues } from "@/validators/propertySchema";
import { Trash2, Plus } from "lucide-react";
import { CadastralCategorySelect } from "@/components/fields/cadastral-category-select"
import { Label } from "@/components/ui/label";

import CitySearch from '@/components/fields/city-search';

interface StepProps {
  form: UseFormReturn<PropertyFormValues>;
}

export function CadastralStep({ form }: StepProps) {
  const items = form.watch("cadastralData") || [];
  const municipalityCode = form.watch("municipalityCode");
  const municipality = form.watch("municipality");
  const addRow = () => {
    form.setValue("cadastralData", [
      ...items,
      { category: "", sheet: "", parcel: "", subaltern: "", municipality, municipalityCode },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = items.filter((_: any, i: number) => i !== index);
    form.setValue("cadastralData", updated);
  };

  const cadastralError = form.formState.errors.cadastralData;

  console.log(cadastralError)


  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Dati catastali</h3>

      {municipality && <span>Comune: {municipality} - Codice catastale: {municipalityCode}</span>}
      {/* errore generale */}

      {!municipality && <Controller name="city" control={form.control} render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor="city">Città *</Label>


          <CitySearch onChange={(postalCode) => {
            form.setValue("zip", postalCode.postalCode);
            form.setValue("province", postalCode.provinceCode || "");
            form.setValue("city", postalCode.placeName || "");
            form.setValue("municipality", postalCode.placeName);
            form.setValue("latitude", parseFloat(postalCode.lat));
            form.setValue("longitude", parseFloat(postalCode.lng));
            form.setValue("municipalityCode", postalCode.municipalityCode);
            form.setValue("country", "IT");
          }} value={form.getValues("city") ?? ""} />

          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
        </div>
      )} />
      }
      {cadastralError?.root?.message && (
        <p className="text-sm text-destructive">
          {cadastralError.root.message}
        </p>
      )}

      {items.map((_, index: number) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 border p-4 rounded-lg"
        >
          {/* Categoria catastale - riga 1 */}
          <div className="col-span-3">
            <CadastralCategorySelect
              form={form}
              index={index}
            />
          </div>

          {/* Elimina riga */}
          <div className="flex items-end justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeRow(index)}
              className="h-9 w-9 p-0 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Foglio */}
          <Controller
            name={`cadastralData.${index}.sheet`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <Input {...field} placeholder="Foglio" />
                {fieldState.error && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Particella */}
          <Controller
            name={`cadastralData.${index}.parcel`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <Input {...field} placeholder="Particella" />
                {fieldState.error && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Subalterno */}
          <Controller
            name={`cadastralData.${index}.subaltern`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <Input {...field} placeholder="Subalterno" />
                {fieldState.error && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      ))}
      {/* errori per riga */}
      {Array.isArray(cadastralError) &&
        cadastralError.map((err, idx) => {
          if (!err) return null;
          const msg =
            err.sheet?.message ||
            err.parcel?.message ||
            err.subaltern?.message;

          return msg ? (
            <p key={idx} className="text-sm text-destructive">
              Riga {idx + 1}: {msg}
            </p>
          ) : null;
        })}

      <Button
        variant="outline"
        onClick={addRow}
        className="w-max flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Aggiungi
      </Button>
    </div>
  );
}