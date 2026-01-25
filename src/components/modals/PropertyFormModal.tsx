"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Property } from "@/types/property";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { GeneralStep } from "./propertySteps/GeneralStep";
import { LocationStep } from "./propertySteps/LocationStep";
import { BuildingStep } from "./propertySteps/BuildingStep";
import { SurfaceStep } from "./propertySteps/SurfaceStep";
import { EnergyStep } from "./propertySteps/EnergyStep";
import { CadastralStep } from "./propertySteps/CadastralStep";
import { OwnerStep } from "./propertySteps/OwnerStep";
import { propertySchema, PropertyFormValues } from "@/validators/propertySchema"


interface PropertyFormModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  property?: Property;
  setProperty: (data: Property) => void;
}

const STEPS = [
  "Generale",
  "Localizzazione",
  "Edificio",
  "Superfici",
  "Energia",
  "Catasto",
  "Proprietario",
];

export function PropertyFormModal({
  open,
  setIsOpen,
  property,
  setProperty,
}: PropertyFormModalProps) {
  const [step, setStep] = useState(0);

  const form = useForm<Property>({
    resolver: zodResolver(propertySchema),
    defaultValues: property,
    mode: "onBlur",
  });
  const { handleSubmit, trigger } = form;



  function next() {
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep(s => Math.max(s - 1, 0));
  }


  const onSubmit: SubmitHandler<PropertyFormValues> = async (values) => {

    console.log(values)
  }



  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {property ? "Modifica edificio" : "Nuovo edificio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(setProperty)} className="space-y-6">
          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="location">Localizzazione</TabsTrigger>
              <TabsTrigger value="building">Edificio</TabsTrigger>
              <TabsTrigger value="surface">Superfici</TabsTrigger>
              <TabsTrigger value="energy">Energia</TabsTrigger>
              <TabsTrigger value="cadastral">Catasto</TabsTrigger>
              <TabsTrigger value="owner">Proprietario</TabsTrigger>
            </TabsList>

            <TabsContent value="location">
              <LocationStep form={form} />
            </TabsContent>

            <TabsContent value="building">
              <BuildingStep form={form} />
            </TabsContent>

            <TabsContent value="surface">
              <SurfaceStep form={form} />
            </TabsContent>

            <TabsContent value="energy">
              <EnergyStep form={form} />
            </TabsContent>

            <TabsContent value="cadastral">
              <CadastralStep form={form} />
            </TabsContent>

            <TabsContent value="owner">
              <OwnerStep form={form} />
            </TabsContent>
          </Tabs>
        </form>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
          >
            Indietro
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Avanti</Button>
          ) : (
            <Button onClick={handleSubmit}>
              {property ? "Salva modifiche" : "Crea edificio"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}