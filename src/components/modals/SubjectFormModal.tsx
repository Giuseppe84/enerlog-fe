// SubjectModal.tsx
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


import { zodResolver } from "@hookform/resolvers/zod";
import { SubjectFormSchema } from "@/validators/subjectSchema";

import { createOrUpdateSubject } from "@/api/subjects";
import { toast } from "sonner";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { format } from "date-fns";

import { Calendar as DatePicker } from "@/components/ui/calendar"; // ShadCN Calendar
import CodiceFiscale from "codice-fiscale-js";



type SubjectFormValues = z.infer<typeof SubjectFormSchema>;
interface SubjectFormModalProps {
  subject: Partial<SubjectFormValues>;
  setSubject: (subjects: SubjectFormValues[] | ((prev: SubjectFormValues[]) => SubjectFormValues[])) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SubjectModal({ subject, isOpen, setIsOpen, setSubject }: SubjectFormModalProps) {

  const form = useForm({
    resolver: zodResolver(SubjectFormSchema),
    defaultValues: {
      type: subject?.type ?? "PHYSICAL",
      ...subject,
    },
  });

  const type = form.watch("type");

  const onSubmit: SubmitHandler<SubjectFormValues> = async (values) => {
    console.log('Submitting subject form with values:', values);
    try {

      const subjectToSubmit = {
        ...values,
        id: subject?.id, // forza l'id originale
      };
      console.log("Submitting values:", values);
      const res = await createOrUpdateSubject({ ...values, id: subject?.id });
      toast.success("Soggetto salvato con successo");
      setSubject(res.data);
      setIsOpen(false);
    } catch {
      toast.error("Errore durante il salvataggio");
    }
  }
  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subject ? "Modifica soggetto" : "Nuovo soggetto"}
          </DialogTitle>
        </DialogHeader>


        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo soggetto */}
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Tipo soggetto</Label>
                <select {...field} className="input">
                  <option value="PHYSICAL">Persona fisica</option>
                  <option value="LEGAL">Persona giuridica</option>
                </select>
              </div>
            )}
          />

          {/* === PHYSICAL === */}
          {type === "PHYSICAL" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Dati anagrafici</h3>
              <div className="grid grid-cols-2 gap-4">
                <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Nome *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Cognome *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>

              <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Codice fiscale *</Label>
                  <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />

              <Controller name="birthDate" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data di nascita *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />

              <Controller name="birthPlace" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Luogo di nascita *</Label>
                  <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />

            </div>
          )}

          {/* === LEGAL === */}

          {type === "LEGAL" && (
            <div>
              <div className="space-y-4" >
                <h3 className="font-semibold">Dati aziendali</h3>
                <Controller name="companyName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Ragione sociale *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="vatNumber" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Partita IVA *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalForm" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Forma giuridica *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="reaNumber" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>REA</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="sdiCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Codice SDI</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="pecEmail" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>PEC</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>


              <div className="space-y-4">
                <h3 className="font-semibold">Sede legale</h3>
                <Controller name="legalAddress" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Indirizzo *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalCity" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Città *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalProvince" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Provincia *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalPostalCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>CAP *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalCountry" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Paese *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>


              <div className="space-y-4">
                <h3 className="font-semibold">Legale rappresentante</h3>
                <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Nome *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Cognome *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Codice fiscale *</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Contatti</h3>
                <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Email</Label>
                    <Input {...field} type="email" className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="phone" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Telefono</Label>
                    <Input {...field} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
