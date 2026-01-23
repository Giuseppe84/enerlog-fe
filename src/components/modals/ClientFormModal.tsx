"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { createOrUpdateClient } from '@/api/clients';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {  useEffect, useState } from 'react';

import CodiceFiscale from 'codice-fiscale-js';
import { Calendar } from "lucide-react"; // icona opzionale
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as DatePicker } from "@/components/ui/calendar"; // il DatePicker di shadcn
import { format } from "date-fns";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import CitySearch from '@/components/fields/city-search';
import { CountrySelector } from '@/components/fields/country-selector';
import{PersonType, LEGAL_FORMS} from '@/data/legal-forms';
import {clientSchema} from '@/validators/clientSchema';



import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  client: Partial<ClientFormValues>;
  setClient: (clients: ClientFormValues[] | ((prev: ClientFormValues[]) => ClientFormValues[])) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ClientFormModal({ client, setClient, setIsOpen, isOpen }: ClientFormModalProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState("IT");
  const [typeForm, setTypeForm] = useState("PHYSICAL");
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      id: client.id ?? undefined,
      type: client.type ?? "PHYSICAL",
      firstName: client.firstName ?? "",
      lastName: client.lastName ?? "",
      gender: client.gender ?? "",
      birthProvince: client.birthProvince ?? "",
      birthPlace: client.birthPlace ?? "",
      birthDate: client.birthDate ?? undefined,
      country: client.country ?? "",
      zip: client.zip ?? "",
      province: client.province ?? "",
      city: client.city ?? "",
      address: client.address ?? "",
      companyName: client.companyName ?? "",
      taxCode: client.taxCode ?? "",
      vatNumber: client.vatNumber ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
    },
    mode: "onBlur",
  });


  const handleSuccess = () => {
    toast.success(t('clients.success.saved'), {
      description: t('clients.success.clientSaved'),
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {
    toast.error(t('clients.error.error'), {
      description: message || t('clients.error.clientError'),
    });
  };



  const type = form.watch("type");
  const taxCodeValue = form.watch("taxCode");

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


  useEffect(() => {
    setTypeForm(type);
  }, [type, form]);

  useEffect(() => {
    console.log("Setting form values for client:", client);
    form.reset({
      id: client.id,
      type: client.type ?? "PHYSICAL",
      firstName: client.firstName ?? "",
      lastName: client.lastName ?? "",
      gender: client.gender ?? "",
      birthProvince: client.birthProvince ?? "",
      birthPlace: client.birthPlace ?? "",
      birthDate: client.birthDate ?? undefined,
      country: client.country ?? "",
      zip: client.zip ?? "",
      province: client.province ?? "",
      city: client.city ?? "",
      address: client.address ?? "",
      companyName: client.companyName ?? "",
      taxCode: client.taxCode ?? "",
      vatNumber: client.vatNumber ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
    });
  }, [client, form]);

  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  const onSubmit: SubmitHandler<ClientFormValues> = async (values) => {
    console.log('Submitting client form with values:', values);
    try {

      const clientToSubmit = {
        ...values,
        id: client.id, // forza l'id originale
      };
      const saved = await createOrUpdateClient(clientToSubmit);
      console.log('Client saved successfully:', clientToSubmit, saved);

      setClient(saved)
      /*
       if (clientToSubmit.id) {
 
         setClient(prev => Array.isArray(prev) ? prev.map(c => c.id === saved.id ? saved : c) : [saved]);
       } else {
         setClient(prev => Array.isArray(prev) ? [...prev, saved] : [saved]);
       }
 */
      handleSuccess();
      form.reset();

      setIsOpen(false);
    } catch (err) {
      console.error(t('clients.error.savingClient'), err);
      handleError(t('clients.error.savingClient'));
      form.reset();
    }
  };

  const personType = form.watch('type');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client.id ? t('clients.form.editClient') : t('clients.form.newClient')}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2 w-full max-w-md space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

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


            {/* PHYSICAL PERSON */}
            {typeForm === "PHYSICAL" && (
              <FieldSet>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Anagrafica</FieldLegend>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (

                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t('clients.form.firstName')} *</Label>
                            <Input id="firstName" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </Field>
                      <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('clients.form.lastName')} *</Label>
                          <Input id="lastName" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                        </div>
                      )} />
                    </div>

                    <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="taxCode">{t('clients.form.taxCode')} *</Label>
                        <Input id="taxCode" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller name="gender" control={form.control} render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label htmlFor="gender">{t('clients.form.gender')} *</Label>
                          <Input id="gender" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                        </div>
                      )} />

                      <Controller
                        name="birthDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="birthDate">{t('clients.form.birthDate')} *</Label>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full justify-start ${fieldState.error ? "border-destructive" : ""}`}
                                >
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

                            {fieldState.error && (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />

                    </div>




                    <div className="grid grid-cols-4 gap-4">




                      <div className="col-span-2">
                        <Controller name="birthPlace" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="birthPlace">{t('clients.form.birthPlace')} *</Label>
                            <Input id="birthPlace" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>
                      <div className="col-span-1">
                        <Controller name="birthProvince" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="birthProvince">{t('clients.form.birthProvince')} *</Label>
                            <Input id="birthProvince" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>
                      <div className="col-span-1">
                        <Controller name="country" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="country">{t('clients.form.country')} *</Label>
                            <Input id="country" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>

                    </div>

                    <FieldSeparator />
                    <FieldLegend>Residenza</FieldLegend>
                    <Controller
                      name="country"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label>{t("clients.form.country")}</Label>

                          <CountrySelector
                            value={field.value}
                            onChange={(value) => {
                              form.setValue("country", value);
                              setCountry(value);
                              if (value !== "IT") {
                                form.setValue("city", "");
                                form.setValue("province", "");
                                form.setValue("zip", "");
                              }
                            }}
                          />

                          {fieldState.error && (
                            <p className="text-sm text-destructive">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {country === "IT" ? (<div className="grid  grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <Controller name="city" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="city">{t('clients.form.city')} *</Label>

                            <CitySearch onChange={(postalCode) => {
                              form.setValue("zip", postalCode.postalCode);
                              form.setValue("province", postalCode.provinceName || "");
                              form.setValue("city", postalCode.placeName || "");
                              form.setValue("country", "IT");
                            }} value={form.getValues("city")} />

                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>
                      <div className="col-span-1">
                        <Controller name="zip" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="zip">{t('clients.form.zip')} *</Label>

                            <Input id="zip" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />

                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>
                      <div className="col-span-3">
                        <Controller name="province" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="province">{t('clients.form.province')} *</Label>
                            <Input id="province" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </div>



                    </div>

                    ) : (
                      <div className="grid grid-flow-row-dense grid-cols-4 gap-4">
                        <div className="col-span-1">
                          <Controller name="zip" control={form.control} render={({ field, fieldState }) => (
                            <div className="space-y-2">
                              <Label htmlFor="zip">{t('clients.form.zip')} *</Label>
                              <Input id="zip" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                            </div>
                          )} />
                        </div>
                        <div className="col-span-3">
                          <Controller name="city" control={form.control} render={({ field, fieldState }) => (
                            <div className="space-y-2">
                              <Label htmlFor="city">{t('clients.form.city')} *</Label>
                              <Input id="city" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                            </div>
                          )} />
                        </div>
                      </div>
                    )}

                    <Controller name="address" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="address">{t('clients.form.address')} *</Label>
                        <Input id="address" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />



                  </div>
                </FieldGroup>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Contatti</FieldLegend>


                  <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('clients.form.email')} *</Label>
                      <Input id="email" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />


                  {/* PHONE */}
                  <Controller name="phone" control={form.control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('clients.form.phone')}</Label>
                      <Input id="phone" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />



                </FieldGroup>
              </FieldSet>

            )}

            {/* LEGAL PERSON */}
            {typeForm === "LEGAL" && (

              <FieldSet>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Anagrafica</FieldLegend>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">


                    <Controller name="companyName" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t('clients.form.companyName')} *</Label>
                        <Input id="companyName" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />


                    {/* VAT NUMBER */}

                    <Controller name="vatNumber" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="vatNumber">{t('clients.form.vatNumber')} *</Label>
                        <Input id="vatNumber" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />

                    {form.watch("type") === "LEGAL" && (
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
                    )}
                    <Controller name="reaNumber" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="reaNumber">{t('clients.form.reaNumber')} *</Label>
                        <Input id="reaNumber" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="chamberCode" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="chamberCode">{t('clients.form.chamberCode')} *</Label>
                        <Input id="chamberCode" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="sdiCode" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="sdiCode">{t('clients.form.sdiCode')} *</Label>
                        <Input id="sdiCode" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="pecEmail" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="pecEmail">{t('clients.form.pecEmail')} *</Label>
                        <Input id="pecEmail" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                  </div>
                </FieldGroup>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Sede legale</FieldLegend>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* LEGAL ADDRESS */}
                    <Controller name="legalAddress" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalAddress">{t('clients.form.legalAddress')} *</Label>
                        <Input id="legalAddress" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />


                    <Controller name="legalCivicNumber" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalCivicNumber">{t('clients.form.legalCivicNumber')} *</Label>
                        <Input id="legalCivicNumber" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="legalPostalCode" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalPostalCode">{t('clients.form.legalPostalCode')} *</Label>
                        <Input id="legalPostalCode" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="legalCity" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalCity">{t('clients.form.legalCity')} *</Label>
                        <Input id="legalCity" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="legalProvince" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalProvince">{t('clients.form.legalProvince')} *</Label>
                        <Input id="legalProvince" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                    <Controller name="legalCountry" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="legalCountry">{t('clients.form.legalCountry')} *</Label>
                        <Input id="legalCountry" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />
                  </div>


                </FieldGroup>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Legale Rappresentante</FieldLegend>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t('clients.form.firstName')} *</Label>
                            <Input id="firstName" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                          </div>
                        )} />
                      </Field>
                      <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('clients.form.lastName')} *</Label>
                          <Input id="lastName" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                        </div>
                      )} />
                    </div>

                    <Controller name="taxCode" control={form.control} render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="taxCode">{t('clients.form.taxCode')} *</Label>
                        <Input id="taxCode" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                      </div>
                    )} />

                  </div>


                </FieldGroup>
                <FieldGroup>
                  <FieldSeparator />
                  <FieldLegend>Contatti</FieldLegend>
                  {/* EMAIL */}
                  <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('clients.form.email')} *</Label>
                      <Input id="email" type="email" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />

                  {/* PHONE */}
                  <Controller name="phone" control={form.control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('clients.form.phone')}</Label>
                      <Input id="phone" {...field} value={field.value ?? ""} className={fieldState.error ? 'border-destructive' : ''} />
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )} />

                </FieldGroup>
              </FieldSet>
            )}



            {/* FOOTER BUTTONS */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t('common.cancel')}</Button>
              </DialogClose>

              <Button type="submit">{t('common.save')}</Button>

            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog >
  );
}