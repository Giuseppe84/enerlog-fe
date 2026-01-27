"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { PersonType, LEGAL_FORMS } from '@/data/legal-forms';
import { zodResolver } from "@hookform/resolvers/zod";
import { SubjectFormSchema } from "@/validators/subjectSchema";
import { Separator } from "@/components/ui/separator"
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

import { useAuth } from "@/context/AuthProvider";
import CitySearch from '@/components/fields/city-search';
import { CountrySelector } from '@/components/fields/country-selector';


type SubjectInput = z.infer<typeof SubjectFormSchema>;

type SubjectFormValues = z.infer<typeof SubjectFormSchema>;
interface SubjectFormModalProps {
  subject: SubjectInput | null;
  setSubject: React.Dispatch<React.SetStateAction<SubjectInput | null>>;
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
  const { t } = useTranslation();
  const type = form.watch("type");
  const taxCodeValue = form.watch("taxCode");
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
    if (isOpen && subject) {
      form.reset(subject);
    }
  }, [isOpen, subject, form]);

  useEffect(() => {
    console.log("Tax code changed:", taxCodeValue);
    console.log("Tax code changed:", taxCodeValue?.length);
    if (!taxCodeValue || taxCodeValue.length !== 16) return;


    try {
      const cf = new CodiceFiscale(taxCodeValue);
      console.log("Parsed Codice Fiscale:", cf);
      if (cf.isValid()) {
        form.setValue("birthDate", cf.birthday.toISOString()); // es. "1985-07-23"
        form.setValue("gender", cf.gender); // "M" o "F"
        form.setValue("birthPlace", cf.birthplace.nome); // es. "H501"
        form.setValue("birthProvince", cf.birthplace.prov); // es. "H501"
      }
    } catch (err) {
      console.log("Invalid tax code:", err);
    }
  }, [taxCodeValue, form]);

  const onSubmit: SubmitHandler<SubjectFormValues> = async (values) => {
    console.log("User info on submit:", user);
    console.log('Submitting subject form with values:', values);
    try {

      if (!user.client) {
        handleError(t('clients.error.authError'));
        return;
      }

      console.log("Submitting values:", values);
      console.log("Submitting values:", user);
      const res = await createOrUpdateSubject({ ...values, id: subject?.id, clientId: user.client.id });
      console.log("API response:", res);
      setSubject(res.subject);
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
            {subject ? "Modifica soggetto" : "Nuovo soggetto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Tipo soggetto */}
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleziona tipo persona" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo persona</SelectLabel>
                    <SelectItem value="PHYSICAL">Persona fisica</SelectItem>
                    <SelectItem value="LEGAL">Persona giuridica</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />


          {/* === PHYSICAL === */}
          {type === "PHYSICAL" && (
            <div className="space-y-4 mt-10">
              <h3 className="font-semibold">Dati anagrafici</h3>
              <div className="grid grid-cols-2 gap-4">
                <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Nome *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Cognome *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>

              <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Codice fiscale *</Label>
                  <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />

              <Controller name="gender" control={form.control} render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('clients.form.gender')} *</Label>
                  <Input id="gender" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
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
                  <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
              <Controller name="birthProvince" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Provincia di nascita *</Label>
                  <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />



              <div className="space-y-4 mt-10">
                <h3 className="font-semibold">Residenza</h3>
                <Separator />
                <Controller name="address" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Indirizzo</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="city" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('clients.form.city')} *</Label>


                    <CitySearch onChange={(postalCode) => {
                      form.setValue("postalCode", postalCode.postalCode);
                      form.setValue("province", postalCode.provinceName || "");
                      form.setValue("city", postalCode.placeName || "");
                      form.setValue("country", "IT");
                    }} value={form.getValues("city") ?? ""} />

                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="postalCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>CAP</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="city" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Città</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="province" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Provincia</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="country" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Paese</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <div className="space-y-4 mt-10">
                  <h3 className="font-semibold">Contatti</h3>
                  <Separator />
                  <Controller name="phone" control={form.control} render={({ field, fieldState }) => (
                    <div>
                      <Label>Telefono</Label>
                      <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />
                  <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                    <div>
                      <Label>Email</Label>
                      <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />
                  <Controller name="pecEmail" control={form.control} render={({ field, fieldState }) => (
                    <div>
                      <Label>PEC</Label>
                      <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />
                </div>


                <div className="space-y-4 mt-10">
                  <h3 className="font-semibold">Dati bancari</h3>
                  <Separator />
                  <Controller name="iban" control={form.control} render={({ field, fieldState }) => (
                    <div>
                      <Label>IBAN</Label>
                      <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />
                  <Controller name="swift" control={form.control} render={({ field, fieldState }) => (
                    <div>
                      <Label>Swift code</Label>
                      <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />
                </div>

              </div>
            </div>
          )}

          {/* === LEGAL === */}

          {type === "LEGAL" && (
            <div>
              <div className="space-y-4 mt-10" >
                <h3 className="font-semibold">Dati aziendali</h3>
                <Separator />
                <Controller name="companyName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Ragione sociale *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="vatNumber" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Partita IVA *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller
                  name="legalForm"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label>Forma giuridica *</Label>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={fieldState.error ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Seleziona forma giuridica" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Forma giuridica</SelectLabel>
                            {LEGAL_FORMS.map(form => (
                              <SelectItem key={form.value} value={form.value}>
                                {form.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
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


                <Controller name="reaNumber" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>REA</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="sdiCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Codice SDI</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="pecEmail" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>PEC</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>

              <div className="space-y-4 mt-10">
                <h3 className="font-semibold">Sede legale</h3>
                <Separator />
                <Controller name="legalAddress" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Indirizzo *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalCity" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('clients.form.city')} *</Label>

                    <CitySearch onChange={(postalCode) => {
                      form.setValue("legalPostalCode", postalCode.postalCode);
                      form.setValue("legalProvince", postalCode.provinceName || "");
                      form.setValue("legalCity", postalCode.placeName || "");
                      form.setValue("legalCountry", "IT");
                    }} value={form.getValues("legalCity") ?? ""} />

                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalProvince" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Provincia *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalPostalCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>CAP *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="legalCountry" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Paese *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>

              <div className="space-y-4 mt-10">



                <h3 className="font-semibold">Legale rappresentante</h3>
                <Separator />
                <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Nome *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Cognome *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Codice fiscale *</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>
              <div className="space-y-4 mt-10">
                <h3 className="font-semibold">Contatti</h3>
                <Separator />
                <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Email</Label>
                    <Input {...field} value={field.value ?? ""} type="email" className={fieldState.error ? "border-destructive" : ""} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </div>
                )} />
                <Controller name="phone" control={form.control} render={({ field, fieldState }) => (
                  <div>
                    <Label>Telefono</Label>
                    <Input {...field} value={field.value ?? ""} className={fieldState.error ? "border-destructive" : ""} />
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
