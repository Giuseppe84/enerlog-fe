"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm, Controller, SubmitHandler, UseFormReturn } from 'react-hook-form';
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

interface PropertyFormModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  property?: Property;
  setProperty: (data: Property) => void;
}

interface StepProps {
  form: UseFormReturn<PropertyFormValues>;
}


export function PropertyFormModal({
  open,
  setIsOpen,
  property,
  setProperty,
}: PropertyFormModalProps) {


  const [currentStep, setCurrentStep] = useState(0);



  const EMPTY_PROPERTY_FORM: PropertyFormValues = {
    address: "",
    city: "",
    province: "",
    zip: "",
    country: "IT",

    yearBuilt: undefined,
    renovationYear: undefined,
    hasElevator: false,
    hasGarage: false,
    hasParking: false,
    hasGarden: false,
    hasBalcony: false,
    hasTerrace: false,

    sup: undefined,
    supCommercial: undefined,
    supLand: undefined,
    volume: undefined,

    energyClass: undefined,
    EPglren: undefined,
    EPglnren: undefined,
    co2: undefined,

    cadastralData: [],

    ownerId: undefined,
    notes: "",
  };
  const STEPS = [
    { id: 0, label: "Localizzazione" },
    { id: 1, label: "Edificio" },
    { id: 2, label: "Superfici" },
    { id: 3, label: "Energia" },
    { id: 4, label: "Catasto" },
    { id: 5, label: "Proprietario" },
  ]
  const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
    0: ["address", "city", "province", "zip", "country"],
    1: [
      "yearBuilt",
      "renovationYear",
      "hasElevator",
      "hasGarage",
      "hasParking",
      "hasGarden",
      "hasBalcony",
      "hasTerrace",
    ],
    2: ["sup", "supCommercial", "supLand", "volume"],
    3: ["energyClass", "EPglren", "EPglnren", "co2"],
    4: ["cadastralData"],
    5: ["ownerId", "notes"],
  };
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? (property as PropertyFormValues)
      : EMPTY_PROPERTY_FORM,
    mode: "onBlur",
  });

  function stepHasErrors(
    stepIndex: number,
    errors: typeof form.formState.errors
  ) {
    const fields = STEP_FIELDS[stepIndex];

    return fields.some((field) => {
      const error = errors[field];
      if (!error) return false;

      // array (es. cadastralData)
      if (Array.isArray(error)) return error.length > 0;

      return true;
    });
  }

  function StepIndicator({
    current,
    setStep,
  }: {
    current: number;
    setStep: (data: number) => void;
  }) {
    const { errors } = form.formState;

    return (
      <div className="h-24 flex flex-wrap gap-2 mb-7">
        {STEPS.map((step, index) => {
          const hasErrors = stepHasErrors(index, errors);

          return (
            <div key={step.id} className="flex items-center gap-2 ml-2">
              <div
                onClick={() => setStep(index)}
                className={`rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer
              ${index === current
                    ? "h-6 w-6 bg-primary text-primary-foreground"
                    : hasErrors
                      ? "h-5 w-5 bg-destructive text-destructive-foreground"
                      : "h-5 w-5 bg-muted text-muted-foreground"
                  }`}
              >
                {index + 1}
              </div>

              <span
                className={`text-sm font-medium hidden sm:block
              ${hasErrors
                    ? "text-destructive"
                    : index === current
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
        <Separator />
      </div>
    );
  }


  function next() {
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setCurrentStep(s => Math.max(s - 1, 0));
  }

  const handleSuccess = (message: string) => {
    toast.success("Soggetto salvato con successo", {
      description: message,
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {
    
    toast.success("Soggetto salvato con successo", {
      description: message,
    });
  };

  const onSubmit: SubmitHandler<PropertyFormValues> = async (values) => {

    try {



      const response = await createOrUpdateProperty({ ...values as Property, id: property?.id });
      console.log("API response:", response);
      setProperty(response.property);
      handleSuccess(response.message);


    } catch (error) {
      console.error("Error saving subject:", error);
      handleError();

    }
  }

  return (



    <Dialog open={open} onOpenChange={setIsOpen} >
      <DialogContent className=" h-[92vh] max-h-[90vh] flex flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {property ? "Modifica edificio" : "Nuovo edificio"}
          </DialogTitle>
        </DialogHeader>


        <StepIndicator current={currentStep} setStep={setCurrentStep} />
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <form id="property-form" onSubmit={form.handleSubmit(onSubmit)} >


            {currentStep === 0 && <LocationStep form={form} />}
            {currentStep === 1 && <BuildingStep form={form} />}
            {currentStep === 2 && <SurfaceStep form={form} />}
            {currentStep === 3 && <EnergyStep form={form} />}
            {currentStep === 4 && <CadastralStep form={form} />}
            {currentStep === 5 && <OwnerStep form={form} />}
          </form>
        </div>

        <DialogFooter className="flex justify-between border-t mt-5 p-4 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={prev}
            disabled={currentStep === 0}
          >
            Indietro
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>Avanti</Button>
          ) : (
            <Button form="property-form" type="submit" >
              {property ? "Salva modifiche" : "Crea edificio"}
            </Button>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>

  );
}