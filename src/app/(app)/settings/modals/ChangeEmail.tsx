'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { userAPI } from "@/api/user";
import { toast } from "sonner"

const EmailSchema = Yup.object().shape({
  email: Yup.string().email("Formato email non valido").required("Email obbligatoria"),
});

export function ChangeEmailModal({ user, setIsOpen, isOpen }) {

  const [emailError, setEmailError] = useState("");

  const handleSuccess = () => {
    toast.success(
      "Operazione completata",
      {description: "L'email è stata aggiornata con successo"}
    );
       setIsOpen(false);
  };

  const handleError = (message?: string) => {
    toast.error( "Errore",
      {description: message || "Si è verificato un errore durante l'aggiornamento"
    });
  };

  const handleEmailChange = async (
    values: { email: string },
    { setSubmitting }: FormikHelpers<{ email: string }>
  ) => {
    setEmailError("");
    try {
      const res = await userAPI.updateEmail(values.email);

      handleSuccess();
   
    } catch (error: any) {
      console.log(error);
      setEmailError(error.response?.data?.message || "Errore durante il cambio email");
      handleError(emailError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full sm:w-[500px] max-w-[80vw] p-6 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Modifica Email</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{ email: user.email || "" }}
          validationSchema={EmailSchema}
          onSubmit={handleEmailChange}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Nuova Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  className={touched.email && errors.email ? "border-destructive" : ""}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-destructive">{String(errors.email)}</p>
                )}
              </div>

              <div className="flex-shrink-0 pt-4 border-t flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Aggiornamento..." : "Salva Modifiche"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
