import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Input } from "@/components/ui/input";

export function CadastralStep({ form }: any) {
  const items = form.watch("cadastralData") || [];

  return (
    <div className="space-y-4">
      {items.map((_: any, index: number) => (
        <div key={index} className="grid grid-cols-3 gap-4 border p-4 rounded">
          <Controller
            name={`cadastralData.${index}.municipality`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="Comune" />
            )}
          />

          <Controller
            name={`cadastralData.${index}.sheet`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="Foglio" />
            )}
          />

          <Controller
            name={`cadastralData.${index}.parcel`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="Particella" />
            )}
          />
        </div>
      ))}
    </div>
  );
}