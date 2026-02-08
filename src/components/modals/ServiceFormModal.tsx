"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateServiceInput, createServiceSchema } from "@/validators/serviceSchema";
import { createOrUpdateService } from "@/api/services";
import { toast } from "sonner";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";


type SubjectInput = z.infer<typeof createServiceSchema>;

interface ServiceFormModalProps {
  service: SubjectInput | null;
  setService: React.Dispatch<React.SetStateAction<SubjectInput | null>>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}


export function ServiceModal({ service, isOpen, setIsOpen, setService }: ServiceFormModalProps) {
  const EMPTY_SERVICE_FORM: SubjectInput = {
    name: "",
    code: "",
    color: "#FFFFAA",
    description: "",
    category: "",
    image: "",
    icon: "",
     url: "",
     isActive:true,
     price:100
  }

  const form = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: service
      ? (service as SubjectInput)
      : EMPTY_SERVICE_FORM,
    mode: "onBlur",
  });
  const { t } = useTranslation();

  const { user } = useAuth();

  const handleSuccess = () => {
    toast.success("Soggetto salvato con successo", {
      description: "I dati del soggetto sono stati salvati correttamente.",
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {
    toast.error(t('clients.error.error'), {
      description: message || t('clients.error.clientError'),
    });
  };



  useEffect(() => {
    console.log("User info on submit:", user);
    if (isOpen && service) {
      form.reset(service);
    }
  }, [isOpen, service, form]);



  const onSubmit: SubmitHandler<UpdateServiceInput> = async (values) => {
    console.log("User info on submit:", user);
    console.log('Submitting subject form with values:', values);
    try {


      console.log("Submitting values:", values);
      console.log("Submitting values:", user);
      const res = await createOrUpdateService({ ...values, id: service?.id });
      console.log("API response:", res);
      setService(res.service);
      handleSuccess();


    } catch (error) {
      console.error("Error saving subject:", error);
      handleError();

    }
  }
  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? "Modifica servizio" : "Nuovo servizio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

          <Controller name="name" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Nome</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="code" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Codice</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="description" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Descrizione</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="category" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Categoria</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />

          <Controller name="color" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Colore</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="image" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Immagine</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="icon" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Icona</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />



          <Controller name="notes" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Note</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />


          <Controller name="price" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>Prezzo</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="isActive" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>isActive</Label>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
          <Controller name="url" control={form.control} render={({ field, fieldState }) => (
            <div>
              <Label>url</Label>
              <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />




          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>



        </form>

      </DialogContent>
    </Dialog >
  );
}
