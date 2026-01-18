"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { userAPI } from "@/api/user";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Formato email non valido").nonempty("Email obbligatoria"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface ChangeEmailModalProps {
  user: { email: string };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ChangeEmailModal({ user, isOpen, setIsOpen }: ChangeEmailModalProps) {
  const [emailError, setEmailError] = useState("");

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user.email ?? "" },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({ email: user.email ?? "" });
  }, [user.email, form]);

  const handleSuccess = () => {
    toast.success("Operazione completata", {
      description: "L'email è stata aggiornata con successo",
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {
    toast.error("Errore", {
      description: message || "Si è verificato un errore durante l'aggiornamento",
    });
  };

  const onSubmit: SubmitHandler<EmailFormValues> = async (values) => {
    setEmailError("");
    try {
      await userAPI.updateEmail(values.email);
      handleSuccess();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Errore durante il cambio email";
      setEmailError(message);
      handleError(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full sm:w-[500px] max-w-[80vw] p-6 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Modifica Email</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="email">Nuova Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...field}
                  value={field.value ?? ""}
                  className={fieldState.error ? "border-destructive" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
                {emailError && !fieldState.error && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            )}
          />

          <div className="flex-shrink-0 pt-4 border-t flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Aggiornamento..." : "Salva Modifiche"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}