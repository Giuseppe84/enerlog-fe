'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectTrigger, SelectGroup, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { userAPI } from "@/api/user";
import { useToast } from "@/hooks/use-toast";
import { COUNTRY_CODES } from "@/data/country-codes";



const PhoneSchema = Yup.object().shape({
  countryPrefix: Yup.string().required("Prefisso obbligatorio"),

  phoneNumber: Yup.string()
    .matches(/^[0-9]{6,15}$/, "Numero di telefono non valido")
    .required("Numero obbligatorio"),

  code: Yup.string().when([], {
    is: () => false,
    then: (s) => s, // fallback
  }),
}).test("code-required-on-step-2", "Codice obbligatorio", function (values) {
  if (this.options.context?.step === 2) {
    return !!values.code;
  }
  return true;
});


export function ChangePhoneModal({ user, setUser, setIsOpen, isOpen }) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneError, setPhoneError] = useState("");

  const handleSuccess = (message: string) => {
    toast({
      title: "Operazione completata",
      description: message,
      variant: "success",
    });
  };

  const handleError = (message?: string) => {
    toast({
      title: "Errore",
      description: message || "Si è verificato un errore",
      variant: "destructive",
    });
  };

  const handleResendCode = async (phoneNumber: string) => {
    try {
      await userAPI.sendPhoneChangeCode({ newPhone: phoneNumber });
      handleSuccess("Codice reinviato con successo");
    } catch (error: any) {
      console.log(error);
      handleError(error.response?.data?.message || "Errore durante l'invio del codice");
    }
  };

  const handleSubmit = async (
    values: { countryPrefix: string; phoneNumber: string; code?: string },
    { setSubmitting }: FormikHelpers<any>
  ) => {
    setPhoneError("");

    try {
      if (step === 1) {
        console.log(values.countryPrefix);
      console.log(values.phoneNumber);
        await userAPI.sendPhoneChangeCode({ newPhone: values.countryPrefix+values.phoneNumber });
        handleSuccess("Codice inviato al numero inserito");
        setStep(2);
      } else {
        console.log('ttt')
        await userAPI.verifyPhoneChange({ code: values.code! });

  

        handleSuccess("Numero di telefono aggiornato e verificato");
        setIsOpen(false);
      }
    } catch (error: any) {
      console.log(error);
      const msg = error.response?.data?.message || "Errore durante l'operazione";
      setPhoneError(msg);
      handleError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full sm:w-[500px] max-w-[80vw] p-6 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Modifica Numero di Telefono</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            countryPrefix: user.countryPrefix || "+39",
            phoneNumber: user.phoneNumber || "",
            code: "",
          }}
          validate={(values) =>
            PhoneSchema.validate(values, { context: { step } })
              .then(() => ({}))
              .catch((err) => ({
                [err.path]: err.message,
              }))
          }
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting, setFieldValue }) => (
            <Form className="space-y-4">

              <div className="flex gap-2 items-start">

                {/* SELECT PREFIX */}
                <div className="w-2/5">
                  <Label>Paese</Label>

                  <Select
                    disabled={step === 2}
                    value={values.countryPrefix}
                    onValueChange={(prefix) => {
                      setFieldValue("countryPrefix", prefix);

                      // rimuovo eventuali prefissi esistenti
                      const numberWithoutPrefix = values.phoneNumber.replace(/^\+\d+/, "");

                      setFieldValue("phoneNumber", prefix + numberWithoutPrefix);
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
                </div>

                {/* PHONE INPUT */}
                <div className="w-3/5">
                  <Label htmlFor="phoneNumber">
                    {step === 1 ? "Nuovo Numero" : "Numero"}
                  </Label>

                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    disabled={step === 2}
                    className={touched.phoneNumber && errors.phoneNumber ? "border-destructive" : ""}
                  />

                  {touched.phoneNumber && errors.phoneNumber && (
                    <p className="text-sm text-destructive">{String(errors.phoneNumber)}</p>
                  )}
                </div>
              </div>

              {/* VERIFY CODE */}
              {step === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="code">Codice di Verifica</Label>

                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={values.code}
                    onChange={handleChange}
                    className={touched.code && errors.code ? "border-destructive" : ""}
                  />

                  {touched.code && errors.code && (
                    <p className="text-sm text-destructive">{String(errors.code)}</p>
                  )}
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleResendCode(values.phoneNumber)}
                  >
                    Rinvia codice
                  </Button>
                )}
              </div>

              {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}

              {/* SUBMIT */}
              <div className="flex-shrink-0 pt-4 border-t flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Invio..." : step === 1 ? "Invia Codice" : "Verifica Codice"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
