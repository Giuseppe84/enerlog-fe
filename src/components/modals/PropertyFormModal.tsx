"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useForm, Controller, SubmitHandler, FieldErrors } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { SetStateAction, useEffect, useState } from "react";
import { Property } from "@/types/property";
import { Separator } from '@/components/ui/separator';
import { LocationStep } from "./propertySteps/LocationStep";
import { BuildingStep } from "./propertySteps/BuildingStep";
import { SurfaceStep } from "./propertySteps/SurfaceStep";
import { EnergyStep } from "./propertySteps/EnergyStep";
import { CadastralStep } from "./propertySteps/CadastralStep";
import { OwnerStep } from "./propertySteps/OwnerStep";
import { propertySchema, PropertyFormValues } from "@/validators/propertySchema"
import { createOrUpdateProperty } from "@/api/properties"
import { toast } from "sonner";
import { generateBuildingName } from "@/utils/generate-building-name";

interface PropertyFormModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  property?: Property;
  setProperty: (data: Property) => void;
}



export function PropertyFormModal({
  open,
  setIsOpen,
  property,
  setProperty,
}: PropertyFormModalProps) {

  const [selectedOwner, setSelectedOwner] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
    0: ["ownerId"],
    1: ["address", "city", "buildingType"],
    2: ["cadastralData"],
    3: ["yearBuilt", "renovationYear"],
    4: ["sup", "supCommercial", "supLand", "volume", "floors"],
    5: ["energyClass", "EPglren"],
  };
  const TAB_INDEX: Record<string, number> = {
    owner: 0,
    location: 1,
    cadastral: 2,
    building: 3,
    surfaces: 4,
    energy: 5,
  };
const EMPTY_PROPERTY_FORM: PropertyFormValues = {
  address: "",
  city: "",
  province: "",
  zip: "",
  country: "IT",

  municipalityId: undefined,
  municipalityCode: "",
  municipality: "",

  longitude: 0,
  latitude: 0,

  yearBuilt: 1990,
  renovationYear: 1990,
  isHistoricalBuilding: false,
  isHabitable: true,
  hasAgibility: false,
  hasElevator: false,
  hasGarage: false,
  hasParking: false,
  hasGarden: false,
  hasBalcony: false,
  hasTerrace: false,

  isNzeb: false,

  propertyType: "RESIDENTIAL",
  conditionStatus: "GOOD",

  sup: 100,
  supCommercial: 100,
  supLand: 100,
  volume: 300,

  energyClass: "G",
  EPglren: 400,
  EPglnren: 400,
  co2: 400,
  energyConsumption: 400,

  seismicClass: undefined,
  heatingType: undefined,
  coolingType: undefined,

  cadastralData: [
    {
      municipality: "",
      municipalityCode: "",
      category: "",
      sheet: "",
      parcel: "",
      subaltern: "",
    },
  ],

  ownerId: undefined,
  notes: "",
};
  function stepHasErrors(
    stepIndex: number,
    errors: FieldErrors<PropertyFormValues>
  ): boolean {
    const fields = STEP_FIELDS[stepIndex] ?? [];
    return fields.some(field => !!errors[field]);
  }

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? (property as PropertyFormValues)
      : EMPTY_PROPERTY_FORM,
    mode: "onBlur",
  });

  const { watch, setValue, getValues } = form;

  // osserviamo i campi che ci interessano
  const owner = watch("ownerId");
  const address = watch("address");
  const city = watch("city");
  const buildingType = watch("buildingType");
  const buildingName = watch("name");

  useEffect(() => {
    const generatedName = generateBuildingName({
      ownerName: selectedOwner?.name,
      address,
      city,
      buildingType,
    });

    if (!generatedName) return;

    // non sovrascrive se l’utente ha scritto a mano
    if (form.formState.dirtyFields.buildingName) return;

    setValue("name", generatedName, {
      shouldDirty: true,
    });
  }, [
    selectedOwner?.name,
    address,
    city,
    buildingType,
  ]);


  const handleSuccess = (message: string) => {
    toast.success("Soggetto salvato con successo", {
      description: message,
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {

    toast.error("Problemi di salvataggio", {
      description: message,
    });
  };

  const onSubmit: SubmitHandler<PropertyFormValues> = async (values) => {

    try {

      console.log("ddds");

      const response = await createOrUpdateProperty({ ...values as Property, id: property?.id });
      console.log("API response:", response);
      setProperty(response.property);
      handleSuccess(response.message);


    } catch (error) {
      console.error("Error saving subject:", error);
      handleError();

    }
  }

  const errors = form.formState.errors;

  console.log(errors)


  return (



    <Dialog open={open} onOpenChange={setIsOpen} >
      <DialogContent className=" h-[92vh] max-h-[90vh] flex flex-col sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {property ? "Modifica edificio" : "Nuovo edificio"}
          </DialogTitle>
        </DialogHeader>



        <div className="flex-1 overflow-y-auto px-4 py-2">
          <form id="property-form" onSubmit={form.handleSubmit(onSubmit)} >

            <Tabs defaultValue="owner" className="w-full">
              <TabsList className="w-full flex flex-wrap">
                {[
                  { value: "owner", label: "Proprietario" },
                  { value: "location", label: "Ubicazione" },
                  { value: "cadastral", label: "Dati catastali" },
                  { value: "building", label: "Caratteristiche" },
                  { value: "surfaces", label: "Superfici" },
                  { value: "energy", label: "Energia" },
                ].map(tab => {
                  const stepIndex = TAB_INDEX[tab.value];
                  const hasError = stepHasErrors(
                    stepIndex,
                    form.formState.errors
                  );

                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      disabled={tab.value !== "owner" && !owner}
                      className={[
                        hasError &&
                        "border border-destructive text-destructive data-[state=active]:bg-destructive/10",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {tab.label}
                      {hasError && (
                        <span className="ml-2 text-xs font-bold">•</span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="owner"><OwnerStep form={form} setSelectedOwner={setSelectedOwner} /></TabsContent>
              <TabsContent value="location"><LocationStep form={form} /></TabsContent>
              <TabsContent value="cadastral"><CadastralStep form={form} /></TabsContent>
              <TabsContent value="building"><BuildingStep form={form} /></TabsContent>
              <TabsContent value="surfaces"><SurfaceStep form={form} /></TabsContent>
              <TabsContent value="energy"><EnergyStep form={form} /></TabsContent>
            </Tabs>


          </form>
        </div>

        <DialogFooter className="flex justify-between border-t mt-5 p-4 bg-background">


          <Button form="property-form" type="submit" >
            {property ? "Salva modifiche" : "Crea edificio"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>

  );
}


