import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from 'react-hook-form';
import { Textarea } from "@/components/ui/textarea";
import { PropertyFormValues } from "@/validators/propertySchema"
import { UsageDestinationSelect } from "@/components/fields/usage-destination-selector"
import { BuildingTypeSelect } from "@/components/fields/building-types-selector"
import { PropertyTypeSelect } from "@/components/fields/property-types-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}

export type conditionStatusTypeOptions = {
  code: string;
  name: string;
};


const conditionStatus: conditionStatusTypeOptions[] = [
  { code: "NEW", name: "Nuova costruzione" },
  { code: "GOOD", name: "Costruzione in buone condizioni" },
  { code: "TO_RENOVATE", name: "Costruzione da riqualificare" },
  { code: "POOR", name: "Costruzione da ristrutturare" }
]
const seismicClassOptions = [
  "A+",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
];

const heatingTypeOptions = [
  { code: "NONE", label: "Assente" },
  { code: "BIOMASS", label: "Biomassa" },
    { code: "GAS", label: "Gas" },
  { code: "HEAT_PUMP", label: "Pompa di calore" },
    { code: "ELECTRIC", label: "Elettrico" },
  { code: "DISTRICT", label: "Teleriscaldamento" },
];


const coolingTypeOptions = [
  { code: "NONE", label: "Assente" },
  { code: "SPLIT", label: "Split" },
  { code: "CENTRALIZED", label: "Centralizzato" },
];

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
      <BuildingTypeSelect
        form={form}
        label="Tipologia dell’immobile"
      />
      <UsageDestinationSelect
        form={form}
        label="Destinazione d’uso dell’immobile"
      />

      <Controller
        name="conditionStatus"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label>Condizioni</Label>

            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Seleziona il tipo di edificio" />
              </SelectTrigger>

              <SelectContent>
                {conditionStatus.map(dest => (
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




      <PropertyTypeSelect
        form={form}
        label="Tipologia proprietà"
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
      <Controller
        name="seismicClass"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label>Classe sismica</Label>

            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Seleziona classe sismica" />
              </SelectTrigger>

              <SelectContent>
                {seismicClassOptions.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
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
      <Controller
        name="heatingType"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label>Tipo di riscaldamento</Label>

            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Seleziona riscaldamento" />
              </SelectTrigger>

              <SelectContent>
                {heatingTypeOptions.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label}
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
      <Controller
        name="coolingType"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label>Tipo di raffrescamento</Label>

            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Seleziona raffrescamento" />
              </SelectTrigger>

              <SelectContent>
                {coolingTypeOptions.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label}
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
      <div className="grid grid-cols-3 gap-4">
        {[
          "hasElevator",
          "hasGarage",
          "hasParking",
          "hasGarden",
          "hasBalcony",
          "hasTerrace",
          "isHistoricalBuilding",
          "isHabitable",
          "hasAgibility"
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
    </div>
  );
}