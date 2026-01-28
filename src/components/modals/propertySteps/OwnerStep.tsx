
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Controller, UseFormReturn } from 'react-hook-form';
import { Card } from "@/components/ui/card";
import { PropertyFormValues } from "@/validators/propertySchema"
import { fetchSubjectById } from "@/api/subjects"
import { useEffect, useState } from "react";
import { Subject } from "@/types/subject";
import { Button } from "@/components/ui/button"
import { SubjectSelector } from "@/components/fields/subject-selector"
import { generateBuildingName } from "@/utils/generate-building-name"



interface StepProps {
  form: UseFormReturn<PropertyFormValues>
  setSelectedOwner: any
}
export function OwnerStep({ form, setSelectedOwner }: StepProps) {
  const ownerId = form.watch("ownerId");

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubjectSelectorOpen, setIsSubjectSelectorOpen] = useState(false);

  useEffect(() => {
    console.log(loading);
    if (!ownerId) {
      setSubject(null);
      return;
    }
    console.log(subject);
    setLoading(true);
    fetchSubjectById(ownerId).then(res => {
      setSubject(res);
      console.log(res);

      const ownerName =
        res.companyName?.trim() ||
        [res.lastName, res.firstName].filter(Boolean).join(" ");

      setSelectedOwner({
        id: res.id,
        name: ownerName,
      });
    })
 
    .finally(() => setLoading(false));
}, [ownerId]);

return (
  <div className="flex flex-col gap-4">
    <h3 className="font-semibold">Proprietario</h3>

    {/* CARD SOGGETTO */}
    {loading && (
      <Card className="p-4 text-sm text-muted-foreground">
        Caricamento soggetto...
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


    {/* DIALOG */}
    <Dialog open={isSubjectSelectorOpen} onOpenChange={setIsSubjectSelectorOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seleziona soggetto</DialogTitle>
          <DialogDescription>
            Scegli il soggetto da associare all’immobile
          </DialogDescription>
        </DialogHeader>

        <SubjectSelector
          onSelectSubject={(subject) => {
            console.log(subject);
            form.setValue("ownerId", subject.id, { shouldValidate: true });
            setIsSubjectSelectorOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  </div>
);
}