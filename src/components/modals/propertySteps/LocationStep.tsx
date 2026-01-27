import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from 'react-hook-form';
import CitySearch from '@/components/fields/city-search';
import { PropertyFormValues } from "@/validators/propertySchema"
import { MapLocationModal } from "../MapLocationModal";
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<PropertyFormValues>
}


export function LocationStep({ form }: StepProps) {
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Localizzazione</h3>
      <Controller
        name="address"
        control={form.control}
        render={({ field,fieldState }) => (
          <div className="col-span-2">
            <Label>Indirizzo</Label>
            <Input {...field} />
            
                {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller name="city" control={form.control} render={({ field, fieldState }) => (
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

      <Controller
        name="province"
        control={form.control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Provincia</Label>
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
        name="zip"
        control={form.control}
        render={({ field ,fieldState}) => (
          <div>
            <Label>CAP</Label>
            <Input {...field} />
                 
                {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <Controller

            name="longitude"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <Label>Longitudine</Label>
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
            name="latitude"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <Label>Latitudine</Label>
                <Input {...field} />
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
        <Button className="self-center" onClick={() => setMapModalOpen(true)}>Localizza</Button>
      </div>
      <MapLocationModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialLatitude={latitude}
        initialLongitude={longitude}
        onSelectLocation={(lat, lng) => {
          form.setValue("latitude", parseFloat(lat));
          form.setValue("longitude", parseFloat(lng));
        }}
      />
    </div>
  );
}