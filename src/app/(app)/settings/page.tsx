'use client'
import { useState, useEffect } from "react";
import { userAPI, UserSettings } from "@/api/user";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";
import TwoFAToggle from "@/components/fields/two-toggle";
import { User, Lock, Bell, Shield, Palette } from "lucide-react";
import { ModeToggle } from "@/components/fields/theme-toggle";

import { ChangePasswordModal } from "./modals/ChangePassword";
import { ChangeEmailModal } from "./modals/ChangeEmail";
import { ChangePhoneModal } from "./modals/ChangePhone"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DevicesPanel } from './devices'

export default function Page() {


  const [user, setUser] = useState<UserSettings>({ name: '', email: '', twoFactorAuth: false, emailNotifications: false, pushNotifications: false });
  const [loading, setLoading] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const [isChangePasswordModalOpen, setChangePasswordModalModalIsOpen] = useState(false);
  const [isChangeEmailModalOpen, setChangeEmailModalModalIsOpen] = useState(false);
  const [isChangePhoneModalOpen, setChangePhoneModalIsOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await userAPI.getUser();
        console.log('Loaded user settings:', response);
        setUser(response);
        setEmailNotifications(response.emailNotifications);
        setPushNotifications(response.pushNotifications);


      } catch (error) {
        console.error('Errore nel caricamento del profilo o delle preferenze di notifica:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);




  const handleNotificationUpdate = async (type: keyof Pick<UserSettings, 'emailNotifications' | 'pushNotifications'>, value: boolean) => {
    try {
      const updatedSettings: UserSettings = {
        ...user,
        [type]: value,
      };
      const response = await userAPI.updateSettings(updatedSettings);
      setUser(response);
      setEmailNotifications(response.emailNotifications);
      setPushNotifications(response.pushNotifications);
    } catch (error) {
      console.error('Errore aggiornamento notifiche:', error);
    }
  };


  if (loading) {
    return (

      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex p-5 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Impostazioni</h2>
              <p className="text-muted-foreground">
                Gestisci il tuo account e le preferenze dell'applicazione
              </p>
            </div>
          </div>
        </header>
        <div className="space-y-6 p-5">



          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">

              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Sicurezza
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-2" />
                Impostazioni accesso
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifiche
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Aspetto
              </TabsTrigger>
            </TabsList>
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tema</CardTitle>
                  <CardDescription>
                    Seleziona il tema per l'interfaccia utente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModeToggle />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>


                <CardContent className="space-y-3">

                  <div className="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4 ...">

                  </div>

                </CardContent>
              </Card>
            </TabsContent>





            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Autenticazione a Due Fattori</CardTitle>
                  <CardDescription>
                    Aggiungi un ulteriore livello di sicurezza al tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>2FA Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Proteggi il tuo account con l'autenticazione a due fattori
                        </p>
                      </div>
                      <TwoFAToggle />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sessioni Attive</CardTitle>
                  <CardDescription>
                    Gestisci i dispositivi che hanno accesso al tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DevicesPanel />
                </CardContent>
              </Card>
              {false && <Card>
                <CardHeader>
                  <CardTitle>Sessioni Attive</CardTitle>
                  <CardDescription>
                    Gestisci i dispositivi che hanno accesso al tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Questa sessione</p>
                        <p className="text-sm text-muted-foreground">Attivo ora</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Corrente
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm">
                      Disconnetti tutti gli altri dispositivi
                    </Button>
                  </div>
                </CardContent>
              </Card>}
            </TabsContent>

            <TabsContent value="password" className="space-y-6">
              {/* Card Modifica Password */}

              <Card >
                <CardHeader>
                  <CardTitle>Impostazioni di accesso</CardTitle>
                  <CardDescription>
                    Configura le credenziali per accedere
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">


                  <div className="flex items-center justify-between">


                    <div className="space-y-3 w-60">
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground flex items-center justify-between gap-3">
                        {user.email}  {user.isEmailVerified ? (
                          <span className="px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            Verificato
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                            Non verificato
                          </span>
                        )}
                      </p>
                    </div>

                    <Button
                      variant="link"
                      onClick={() => {
                        setChangeEmailModalModalIsOpen(true);
                      }}
                    >
                      Modifica
                    </Button>

                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-3  w-60">
                      <Label>Telefono</Label>
                      <p className="text-sm text-muted-foreground flex items-center justify-between">
                        {!user.phone ? "Nessun numero" : <>
                          {user.phone}
                          {user.isPhoneVerified ? (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              Verificato
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                              Non verificato
                            </span>
                          )}
                        </>}
                      </p>



                    </div>

                    <Button variant="link" onClick={() => setChangePhoneModalIsOpen(true)}>
                      Modifica
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">

                      <span className="text-sm font-medium text-gray-700">
                        Modifica password
                      </span>
                    </div>
                    <Button
                      variant="link"
                      onClick={(e) => {
                        // ← fermiamo la propagazione verso i Tabs
                        setChangePasswordModalModalIsOpen(true);
                      }}
                    >
                      Modifica
                    </Button>
                  </div>
                </CardContent>

              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferenze Notifiche</CardTitle>
                  <CardDescription>
                    Configura come vuoi ricevere le notifiche
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifiche Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Ricevi notifiche via email per eventi importanti
                      </p>
                    </div>
                    <Button
                      variant={emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationUpdate('emailNotifications', !emailNotifications)}
                    >
                      {emailNotifications ? 'Attivo' : 'Disattivo'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifiche Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Ricevi notifiche push nel browser
                      </p>
                    </div>
                    <Button
                      variant={pushNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationUpdate('pushNotifications', !pushNotifications)}
                    >
                      {pushNotifications ? 'Attivo' : 'Disattivo'}
                    </Button>
                  </div>

                  <Separator />

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>


          <ChangePasswordModal user={user} setIsOpen={setChangePasswordModalModalIsOpen} isOpen={isChangePasswordModalOpen} />
          <ChangeEmailModal user={user} setIsOpen={setChangeEmailModalModalIsOpen} isOpen={isChangeEmailModalOpen} />
          <ChangePhoneModal user={user} setIsOpen={setChangePhoneModalIsOpen} isOpen={isChangePhoneModalOpen} />


        </div>
      </SidebarInset >
    </SidebarProvider>


  );
}
