
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Controller, UseFormReturn } from 'react-hook-form';
import { Card } from "@/components/ui/card";
import { CTPracticeSchema } from "@/validators/practiceSchema"
import { fetchClientById } from "@/api/clients";
import { fetchSubjectById } from "@/api/subjects";
import { fetchPropertyById } from "@/api/properties";
import { useEffect, useState } from "react";
import { Subject } from "@/types/subject";
import { Client } from "@/types/client";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button"
import { SubjectSelector } from "@/components/fields/subject-selector"
import { ClientSelector } from "@/components/fields/client-selector"
import { PropertySelector } from "@/components/fields/property-selector"
import { generateBuildingName } from "@/utils/generate-building-name"
import { CTPracticeFormValues } from '@/components/modals/PracticeFormModal'


interface StepProps {
  form: UseFormReturn<CTPracticeFormValues>
  setSelectedSubject: any,
  setSelectedClient: any
}
export function SubjectStep({ form, setSelectedSubject, setSelectedClient }: StepProps) {
  const subjectId = form.watch("subjectId");
  const clientId = form.watch("clientId");
  const propertyId = form.watch("propertyId");

  const [subject, setSubject] = useState<Subject | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [isSubjectSelectorOpen, setIsSubjectSelectorOpen] = useState(false);
  const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false);

const [subjects, setSubjects] = useState<Subject[]>([]);
const [properties, setProperties] = useState<Property[]>([]);

const [loadingSubjects, setLoadingSubjects] = useState(false);
const [loadingProperties, setLoadingProperties] = useState(false);

useEffect(() => {
    setSubject(null);
    setProperty(null);
  /*
  if (!clientId) {
    setSubject(null);
    setProperty(null);
    return;
  }
*/
  const loadClients = async () => {
    try {
      setLoadingSubjects(true);
      const data = await fetchClientById(clientId);
      console.log(data)
      setClient(data);
      form.setValue("clientId", data.id)
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubjects(false);
    }
  };

  loadClients();
}, [clientId]);

useEffect(() => {
   setProperty(null);

  const loadSubjects = async () => {
    try {
      setLoadingProperties(true);
      const data = await fetchSubjectById(subjectId);
      setSubject(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProperties(false);
    }
  };

  loadSubjects();
}, [subjectId]);

useEffect(() => {
   setProperty(null);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const data = await fetchPropertyById(propertyId);
      setProperty(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProperties(false);
    }
  };

  loadProperties();
}, [propertyId]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Proprietario</h3>

      {/* CARD SOGGETTO */}
      {loading && (
        <Card className="p-4 text-sm text-muted-foreground">
          Caricamento soggetto...
        </Card>
      )}

      {!loading && !client && (
        <Card onClick={() => setIsClientSelectorOpen(true)} className="p-4 text-sm text-muted-foreground">
          Nessun cliente selezionato
        </Card>
      )}

    {!loading && client && (
        <Card onClick={() => setIsClientSelectorOpen(true)} className="p-4 flex items-start justify-between gap-4 cursor-pointer transition border hover:shadow-lg hover:border-primary/40" >
          <div className="space-y-1">
            {/* Nome */}
            {client.type === "PHYSICAL" && (
              <div className="text-base font-semibold">
                {client.lastName} {client.firstName}
              </div>
            )}

            {client.type === "LEGAL" && (
              <div className="text-base font-semibold">
                {client.companyName}
              </div>
            )}

            {/* Codici */}
            {client.taxCode && (
              <div className="text-sm text-muted-foreground">
                CF: {client.taxCode}
              </div>
            )}

      

            {/* Responsabile */}
            {client.type === "LEGAL" &&
              (client.firstName || client.lastName) && (
                <div className="text-xs text-muted-foreground">
                  Resp.: {client.firstName} {client.lastName}
                </div>
              )}
          </div>

          {/* Badge */}
          <div className="shrink-0">
            <span className="text-xs px-2 py-1 rounded-md bg-muted">
              {client.type === "PHYSICAL"
                ? "Persona fisica"
                : "Persona giuridica"}
            </span>
          </div>
        </Card>
      )}

      {!loading && subject && (
        <Card onClick={() => setIsSubjectSelectorOpen(true)} className="p-4 flex items-start justify-between gap-4 cursor-pointer transition border hover:shadow-lg hover:border-primary/40" >
          <div className="space-y-1">
            {/* Nome */}
            {subject.type === "PHYSICAL" && (
              <div className="text-base font-semibold">
                {subject.lastName} {subject.firstName}
              </div>
            )}

            {subject.type === "LEGAL" && (
              <div className="text-base font-semibold">
                {subject.companyName}
              </div>
            )}

            {/* Codici */}
            {subject.taxCode && (
              <div className="text-sm text-muted-foreground">
                CF: {subject.taxCode}
              </div>
            )}

            {subject.vatNumber && (
              <div className="text-sm text-muted-foreground">
                P.IVA: {subject.vatNumber}
              </div>
            )}

            {/* Responsabile */}
            {subject.type === "LEGAL" &&
              (subject.firstName || subject.lastName) && (
                <div className="text-xs text-muted-foreground">
                  Resp.: {subject.firstName} {subject.lastName}
                </div>
              )}
          </div>

          {/* Badge */}
          <div className="shrink-0">
            <span className="text-xs px-2 py-1 rounded-md bg-muted">
              {subject.type === "PHYSICAL"
                ? "Persona fisica"
                : "Persona giuridica"}
            </span>
          </div>
        </Card>
      )}

      {!loading && !subject && (
        <Card onClick={() => setIsSubjectSelectorOpen(true)} className="p-4 text-sm text-muted-foreground">
          Nessun soggetto selezionato
        </Card>
      )}


  {!loading && property && (
        <Card onClick={() => setIsPropertySelectorOpen(true)} className="p-4 flex items-start justify-between gap-4 cursor-pointer transition border hover:shadow-lg hover:border-primary/40" >
          <div className="space-y-1">
          

            {/* Codici */}
            {property.city && (
              <div className="text-sm text-muted-foreground">
                Città: {property.city}
              </div>
            )}

            {property.address && (
              <div className="text-sm text-muted-foreground">
                Indirizzo {property.address}
              </div>
            )}

        
          </div>

         
        </Card>
      )}

      {!loading && !property && (
        <Card onClick={() => setIsPropertySelectorOpen(true)} className="p-4 text-sm text-muted-foreground">
          Nessun edificio selezionato
        </Card>
      )}



      {/* DIALOG CLIENT */}
      <Dialog open={isClientSelectorOpen} onOpenChange={setIsSubjectSelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Seleziona soggetto</DialogTitle>
            <DialogDescription>
              Scegli il soggetto da associare all’immobile
            </DialogDescription>
          </DialogHeader>

          <ClientSelector
            onSelectClient={(client) => {
              console.log(client);
              form.setValue("clientId", client.id, { shouldValidate: true });
              setIsClientSelectorOpen(false); client
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG SUBJECT */}
      <Dialog open={isSubjectSelectorOpen} onOpenChange={setIsSubjectSelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Seleziona soggetto</DialogTitle>
            <DialogDescription>
              Scegli il soggetto da associare all’immobile
            </DialogDescription>
          </DialogHeader>

          <SubjectSelector
            client={client}
            onSelectSubject={(subject) => {
              console.log(subject);
              form.setValue("subjectId", subject.id, { shouldValidate: true });
              setIsSubjectSelectorOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

       {/* DIALOG PROPERTY */}
      <Dialog open={isPropertySelectorOpen} onOpenChange={setIsPropertySelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Seleziona soggetto</DialogTitle>
            <DialogDescription>
              Scegli il soggetto da associare all’immobile
            </DialogDescription>
          </DialogHeader>

          <PropertySelector
            onSelectProperty={(property) => {
              console.log(client);
              form.setValue("propertyId", property.id, { shouldValidate: true });
              setIsPropertySelectorOpen(false); 
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}