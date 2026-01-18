"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectTrigger, SelectGroup, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { userAPI } from "@/api/user";
import { COUNTRY_CODES } from "@/data/country-codes";
import { toast } from "sonner";

const phoneSchema = z.object({
  countryPrefix: z.string().nonempty("Prefisso obbligatorio"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{6,15}$/, "Numero di telefono non valido")
    .nonempty("Numero obbligatorio"),
  code: z.string().optional(),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

interface ChangePhoneModalProps {
  user: { countryPrefix?: string; phoneNumber?: string };
  setUser: (user: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ChangePhoneModal({ user, setUser, isOpen, setIsOpen }: ChangePhoneModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneError, setPhoneError] = useState("");

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryPrefix: user.countryPrefix ?? "+39",
      phoneNumber: user.phoneNumber ?? "",
      code: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      countryPrefix: user.countryPrefix ?? "+39",
      phoneNumber: user.phoneNumber ?? "",
      code: "",
    });
  }, [user.countryPrefix, user.phoneNumber, form]);

  const handleSuccess = (message: string) => {
    toast.success("Operazione completata", { description: message });
  };

  const handleError = (message?: string) => {
    toast.error("Errore", { description: message || "Si è verificato un errore durante l'aggiornamento" });
  };

  const handleResendCode = async (phoneNumber: string) => {
    try {
      await userAPI.sendPhoneChangeCode({ newPhone: phoneNumber });
      handleSuccess("Codice reinviato con successo");
    } catch (error: any) {
      console.error(error);
      handleError(error.response?.data?.message || "Errore durante l'invio del codice");
    }
  };

  const onSubmit: SubmitHandler<PhoneFormValues> = async (values) => {
    setPhoneError("");

    try {
      if (step === 1) {
        await userAPI.sendPhoneChangeCode({ newPhone: values.countryPrefix + values.phoneNumber });
        handleSuccess("Codice inviato al numero inserito");
        setStep(2);
      } else {
        if (!values.code) throw new Error("Codice obbligatorio");
        await userAPI.verifyPhoneChange({ code: values.code });
        handleSuccess("Numero di telefono aggiornato e verificato");
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Errore durante l'operazione";
      setPhoneError(msg);
      handleError(msg);
    }
  };

  const values = form.watch();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full sm:w-[500px] max-w-[80vw] p-6 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Modifica Numero di Telefono</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex gap-2 items-start">
            {/* SELECT PREFIX */}
            <div className="w-2/5">
              <Label>Paese</Label>
              <Controller
                name="countryPrefix"
                control={form.control}
                render={({ field }) => (
                  <Select
                    disabled={step === 2}
                    value={field.value ?? "+39"}
                    onValueChange={(prefix) => {
                      field.onChange(prefix);
                      const numberWithoutPrefix = (values.phoneNumber ?? "").replace(/^\+\d+/, "");
                      form.setValue("phoneNumber", prefix + numberWithoutPrefix);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.label} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* PHONE INPUT */}
            <div className="w-3/5">
              <Label htmlFor="phoneNumber">{step === 1 ? "Nuovo Numero" : "Numero"}</Label>
              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="phoneNumber"
                      type="text"
                      {...field}
                      value={field.value ?? ""}
                      disabled={step === 2}
                      className={fieldState.error ? "border-destructive" : ""}
                    />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
          </div>

          {/* VERIFY CODE */}
          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="code">Codice di Verifica</Label>
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="code"
                      type="text"
                      {...field}
                      value={field.value ?? ""}
                      className={fieldState.error ? "border-destructive" : ""}
                    />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
          )}

          {/* EXTRA BUTTONS */}
          <div className="flex justify-end mt-2 gap-2">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Modifica numero
              </Button>
            )}
            {step === 2 && (
              <Button type="button" variant="ghost" onClick={() => handleResendCode(values.phoneNumber ?? "")}>
                Rinvia codice
              </Button>
            )}
          </div>

          {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}

          {/* SUBMIT */}
          <div className="flex-shrink-0 pt-4 border-t flex justify-end">
            <Button type="submit">
              {form.formState.isSubmitting
                ? "Invio..."
                : step === 1
                ? "Invia Codice"
                : "Verifica Codice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}