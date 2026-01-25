import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';


export function SurfaceStep({ form }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="sup"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Superficie (mq)</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="supCommercial"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Superficie commerciale</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="supLand"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Superficie terreno</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />

      <Controller
        name="volume"
        control={form.control}
        render={({ field }) => (
          <div>
            <Label>Volume (mc)</Label>
            <Input type="number" {...field} />
          </div>
        )}
      />
    </div>
  );
}