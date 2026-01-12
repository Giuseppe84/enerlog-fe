
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { userAPI } from "@/api/user";
import { toast } from "sonner"


const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Password attuale obbligatoria'),
    newPassword: Yup.string().min(6, 'Minimo 6 caratteri').required('Nuova password obbligatoria'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Le password non corrispondono')
        .required('Conferma password obbligatoria'),
});

export function ChangePasswordModal({ user, setIsOpen, isOpen }) {



    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const handleSuccess = () => {
        toast.success(
            "Operazione completata",
            { description: "La password è stata modificata con successo" }
        );
    };

    const handleError = (message: string | null) => {
        toast.error("Errore",
            {
                description: message || "Si è verificato un errore durante l'aggiornamento"
            });
    };


    const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }, { setSubmitting, resetForm }: FormikHelpers<{ currentPassword: string; newPassword: string; confirmPassword: string }>) => {
        setPasswordError('');
        setPasswordSuccess('');
        try {
            const res = await userAPI.updatePassword({ oldPassword: values.currentPassword, newPassword: values.newPassword });

            setPasswordSuccess('Password modificata con successo');
            handleSuccess();
            resetForm();
            setIsOpen(false);
        } catch (error: any) {
            handleError(null);
            console.log(error);
            setPasswordError(error.response?.data?.message || 'Errore durante il cambio password');
        } finally {

            setSubmitting(false);
        }
    };


    return (


        <Dialog open={isOpen} onOpenChange={setIsOpen}>

            <DialogContent className="w-full sm:w-[500px] max-w-[80vw] min-h-[200px] p-6 flex flex-col">


                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Modifica Profilo</DialogTitle>
                </DialogHeader>

                <Formik
                    initialValues={{
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    }}
                    validationSchema={PasswordSchema}
                    onSubmit={handlePasswordChange}
                >
                    {({ values, errors, touched, handleChange, isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Password Attuale</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={values.currentPassword}
                                    onChange={handleChange}
                                    className={touched.currentPassword && errors.currentPassword ? 'border-destructive' : ''}
                                />
                                {touched.currentPassword && errors.currentPassword && (
                                    <p className="text-sm text-destructive">{String(errors.currentPassword)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nuova Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={values.newPassword}
                                    onChange={handleChange}
                                    className={touched.newPassword && errors.newPassword ? 'border-destructive' : ''}
                                />
                                {touched.newPassword && errors.newPassword && (
                                    <p className="text-sm text-destructive">{String(errors.newPassword)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    className={touched.confirmPassword && errors.confirmPassword ? 'border-destructive' : ''}
                                />
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{String(errors.confirmPassword)}</p>
                                )}
                            </div>

                            <div className="flex-shrink-0 pb-10 mb-12 p-6 border-t bg-background flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Aggiornamento...' : 'Salva Modifiche'}
                                </Button>
                            </div>


                        </Form>
                    )}
                </Formik>

            </DialogContent>
        </Dialog>
    )
}