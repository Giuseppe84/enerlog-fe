import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Input } from "@/components/ui/input";


export function OwnerStep({ form }: any) {
  return (
    <div className="grid gap-4">
      <Controller
        name="ownerId"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Proprietario</Label>
            <Input {...field} />
          </div>
        )}
      />

      <Controller
        name="notes"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Note</Label>
            <Input {...field} />
          </div>
        )}
      />
    </div>
  );
}