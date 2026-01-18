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

const passwordSchema = z
  .object({
    currentPassword: z.string().nonempty("Password attuale obbligatoria"),
    newPassword: z.string().min(6, "Minimo 6 caratteri").nonempty("Nuova password obbligatoria"),
    confirmPassword: z.string().nonempty("Conferma password obbligatoria"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ChangePasswordModal({ user, isOpen, setIsOpen }: ChangePasswordModalProps) {
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSuccess = () => {
    toast.success("Operazione completata", {
      description: "La password è stata modificata con successo",
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {
    toast.error("Errore", {
      description: message || "Si è verificato un errore durante l'aggiornamento",
    });
  };

  const onSubmit: SubmitHandler<PasswordFormValues> = async (values) => {
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await userAPI.updatePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordSuccess("Password modificata con successo");
      handleSuccess();
      form.reset();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Errore durante il cambio password";
      setPasswordError(message);
      handleError(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full sm:w-[500px] max-w-[80vw] min-h-[200px] p-6 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Modifica Profilo</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Attuale</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                  className={fieldState.error ? "border-destructive" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
                {passwordError && !fieldState.error && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                  className={fieldState.error ? "border-destructive" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                  className={fieldState.error ? "border-destructive" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <div className="flex-shrink-0 pb-10 mb-12 p-6 border-t bg-background flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Aggiornamento..." : "Salva Modifiche"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}