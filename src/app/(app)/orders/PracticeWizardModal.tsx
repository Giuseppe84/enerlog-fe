"use client";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Service } from "@/types/service"
import { toArray } from "./new/WizardParts"
import { PropertyFormModal } from "@/components/forms/PropertyFormModal"
import type { Property } from "@/types/property";


// ---------------------------------------------------------------------------
// TODO: adatta questi import/nomi alle tue API reali.
//  - fetchSubjects():  () => Promise<Subject[]>
//  - createSubject():  (payload) => Promise<Subject>   (deve restituire l'id)
//  - fetchPropertiesBySubject(subjectId) esiste già
//  - createProperty(): (payload con subjectId) => Promise<Property>
//  - fetchServices():  () => Promise<Service[]>
// ---------------------------------------------------------------------------
import { fetchSubjects, createOrUpdateSubject } from "@/api/subjects"
import { fetchPropertiesBySubject, createOrUpdateProperty } from "@/api/properties"
import { fetchServices } from "@/api/services"

import {
  WizardSteps,
  PickList,
  ModeToggle,
  Field,
  personLabel,
  formatEuro,
} from "./new/WizardParts"

// ---------- Tipi locali (minimi, per il wizard) ----------

export interface SubjectOption {
  id: string
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
  fiscalCode?: string | null
}



/** Bozza di pratica restituita dal wizard: gli id sono già validi lato server. */
export interface PracticeDraft {
  subject: SubjectOption
  property: PropertyOption
  service: Service
  name: string
  description: string
  type: string
  amount: string
  startDate: string | null
  endDate: string | null
}

const STEPS = ["Soggetto", "Immobile", "Servizio", "Pratica"]

const emptySubject = {
  isCompany: false,
  firstName: "",
  lastName: "",
  companyName: "",
  fiscalCode: "",
  email: "",
  phone: "",
}

const emptyProperty = { address: "", city: "", province: "", zipCode: "" }

const propertyLabel = (p: Property) => p.address || "Immobile senza indirizzo"
const propertySubtitle = (p: Property) =>
  [p.city, p.province].filter(Boolean).join(" · ") || undefined

export function PracticeWizardModal({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (draft: PracticeDraft) => void
}) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Passo 1: soggetto
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectMode, setSubjectMode] = useState<"select" | "create">("select")
  const [subject, setSubject] = useState<SubjectOption | null>(null)
  const [newSubject, setNewSubject] = useState(emptySubject)

  // Passo 2: immobile
  const [properties, setProperties] = useState<Property[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [propertyMode, setPropertyMode] = useState<"select" | "create">("select")
  const [property, setProperty] = useState<Property | null>(null)
  const [newProperty, setNewProperty] = useState(emptyProperty)

  // Passo 3: servizio
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [service, setService] = useState<Service | null>(null)

  // Passo 4: pratica
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    amount: "",
    startDate: "",
    endDate: "",
  })

  // Reset ogni volta che il modale si apre
  useEffect(() => {
    if (!open) return
    setStep(0)
    setSaving(false)
    setError(null)
    setSubjectMode("select")
    setSubject(null)
    setNewSubject(emptySubject)
    setPropertyMode("select")
    setProperty(null)
    setProperties([])
    setNewProperty(emptyProperty)
    setService(null)
    setForm({ name: "", description: "", type: "", amount: "", startDate: "", endDate: "" })
  }, [open])

  // Caricamento dati per passo
  useEffect(() => {
    if (!open) return
    let cancelled = false

    if (step === 0 && subjects.length === 0) {
      setSubjectsLoading(true)
      fetchSubjects()
        .then((data: any) => !cancelled && setSubjects(toArray<SubjectOption>(data)))

        .catch(() => !cancelled && setError("Impossibile caricare i soggetti."))
        .finally(() => !cancelled && setSubjectsLoading(false))
    }

    if (step === 1 && subject) {
      setPropertiesLoading(true)
      fetchPropertiesBySubject(subject.id)
        .then((data: any) => {
          if (cancelled) return
          const list = toArray<Property>(data)
          setProperties(list)
          // Se il soggetto non ha immobili, proponi direttamente la creazione
          if (list.length === 0) setPropertyMode("create")
        })
        .catch(() => !cancelled && setError("Impossibile caricare gli immobili."))
        .finally(() => !cancelled && setPropertiesLoading(false))
    }

    if (step === 2 && services.length === 0) {
      setServicesLoading(true)
      fetchServices()
        .then((data: any) => !cancelled && setServices(toArray<Service>(data).filter((s) => s.isActive)))
        .catch(() => !cancelled && setError("Impossibile caricare i servizi."))
        .finally(() => !cancelled && setServicesLoading(false))
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, subject?.id])

  const selectSubject = (s: SubjectOption) => {
    if (s.id !== subject?.id) {
      // Cambiando soggetto, l'immobile scelto non è più valido
      setProperty(null)
      setProperties([])
      setPropertyMode("select")
    }
    setSubject(s)
  }

  // ---------- Avanzamento ----------

  const next = async () => {
    setError(null)

    if (step === 0) {
      if (subjectMode === "select") {
        if (!subject) return setError("Seleziona un soggetto.")
      } else {
        const n = newSubject
        const valid = n.isCompany ? n.companyName.trim() : n.firstName.trim() && n.lastName.trim()
        if (!valid) {
          return setError(n.isCompany ? "Inserisci la ragione sociale." : "Inserisci nome e cognome.")
        }
        setSaving(true)
        try {
          const { isCompany, ...rest } = n
          const payload = isCompany
            ? { ...rest, firstName: null, lastName: null }
            : { ...rest, companyName: null }
          const created = (await createOrUpdateSubject(payload as any)) as unknown as SubjectOption
          setSubjects((prev) => [created, ...prev])
          selectSubject(created)
          setSubjectMode("select")
        } catch {
          setSaving(false)
          return setError("Errore nella creazione del soggetto.")
        }
        setSaving(false)
      }
      return setStep(1)
    }

    if (step === 1) {
      if (propertyMode === "select") {
        if (!property) return setError("Seleziona un immobile.")
      } else {
        if (!newProperty.address.trim()) return setError("Inserisci l'indirizzo dell'immobile.")
        setSaving(true)
        try {
          const created = (await createOrUpdateProperty({
            ...newProperty,
            subjectId: subject!.id,
          } as any)) as unknown as Property
          setProperties((prev) => [created, ...prev])
          setProperty(created)
          setPropertyMode("select")
        } catch {
          setSaving(false)
          return setError("Errore nella creazione dell'immobile.")
        }
        setSaving(false)
      }
      return setStep(2)
    }

    if (step === 2) {
      if (!service) return setError("Seleziona un servizio.")
      // Precompila la pratica dai dati del servizio (solo se ancora vuota)
      setForm((f) => ({
        ...f,
        name: f.name || service.name,
        amount: f.amount || String(service.price ?? ""),
        description: f.description || service.description || "",
      }))
      return setStep(3)
    }

    // step 3: conferma
    if (!form.name.trim()) return setError("Inserisci il nome della pratica.")
    if (form.amount === "" || Number(form.amount) < 0) return setError("Inserisci un importo valido.")
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setError("La data di fine non può precedere quella di inizio.")
    }

    onComplete({
      subject: subject!,
      property: property!,
      service: service!,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      amount: String(Number(form.amount)),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
    onOpenChange(false)
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  const isLast = step === STEPS.length - 1



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova pratica</DialogTitle>
          <DialogDescription>
            Passo {step + 1} di {STEPS.length}: {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <WizardSteps steps={STEPS} current={step} />

        <div className="min-h-[22rem] space-y-4 pt-2">
          {/* ---- Passo 1: soggetto ---- */}
          {step === 0 && (
            <>
              <ModeToggle value={subjectMode} onChange={setSubjectMode} />
              {subjectMode === "select" ? (
                <PickList
                  items={subjects}
                  loading={subjectsLoading}
                  selectedId={subject?.id}
                  getId={(s) => s.id}
                  getLabel={personLabel}
                  getSubtitle={(s) => s.fiscalCode || undefined}
                  onSelect={selectSubject}
                  placeholder="Cerca per nome o codice fiscale..."
                  empty="Nessun soggetto trovato. Creane uno nuovo."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newSubject.isCompany}
                        onChange={(e) => setNewSubject({ ...newSubject, isCompany: e.target.checked })}
                      />
                      Il soggetto è un&apos;azienda
                    </label>
                  </div>
                  {newSubject.isCompany ? (
                    <Field label="Ragione sociale *" htmlFor="s-company" className="sm:col-span-2">
                      <Input
                        id="s-company"
                        value={newSubject.companyName}
                        onChange={(e) => setNewSubject({ ...newSubject, companyName: e.target.value })}
                      />
                    </Field>
                  ) : (
                    <>
                      <Field label="Nome *" htmlFor="s-first">
                        <Input
                          id="s-first"
                          value={newSubject.firstName}
                          onChange={(e) => setNewSubject({ ...newSubject, firstName: e.target.value })}
                        />
                      </Field>
                      <Field label="Cognome *" htmlFor="s-last">
                        <Input
                          id="s-last"
                          value={newSubject.lastName}
                          onChange={(e) => setNewSubject({ ...newSubject, lastName: e.target.value })}
                        />
                      </Field>
                    </>
                  )}
                  <Field label="Codice fiscale" htmlFor="s-cf">
                    <Input
                      id="s-cf"
                      value={newSubject.fiscalCode}
                      onChange={(e) => setNewSubject({ ...newSubject, fiscalCode: e.target.value.toUpperCase() })}
                    />
                  </Field>
                  <Field label="Telefono" htmlFor="s-phone">
                    <Input
                      id="s-phone"
                      value={newSubject.phone}
                      onChange={(e) => setNewSubject({ ...newSubject, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="Email" htmlFor="s-email" className="sm:col-span-2">
                    <Input
                      id="s-email"
                      type="email"
                      value={newSubject.email}
                      onChange={(e) => setNewSubject({ ...newSubject, email: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            </>
          )}

          {/* ---- Passo 2: immobile ---- */}
          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                Immobile di <span className="font-medium text-foreground">{personLabel(subject)}</span>
              </p>
              <ModeToggle value={propertyMode} onChange={setPropertyMode} />
              {propertyMode === "select" ? (
                <PickList
                  items={properties}
                  loading={propertiesLoading}
                  selectedId={property?.id}
                  getId={(p) => p.id}
                  getLabel={propertyLabel}
                  getSubtitle={propertySubtitle}
                  onSelect={setProperty}
                  placeholder="Cerca per indirizzo..."
                  empty="Nessun immobile per questo soggetto. Creane uno nuovo."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {subject && (
                     <PropertyFormModal
          open={propertyMode === "create"}
          setIsOpen={setPropertyMode}
          subject={subject}
          property={newProperty}
          onChange={setNewProperty}
        />
                  )}
                </div>
              )}


            </>
          )}

          {/* ---- Passo 3: servizio ---- */}
          {step === 2 && (
            <PickList
              items={services}
              loading={servicesLoading}
              selectedId={service?.id}
              getId={(s) => s.id}
              getLabel={(s) => s.name}
              getSubtitle={(s) => `${s.code} · ${s.category} · ${formatEuro(s.price)}`}
              onSelect={setService}
              placeholder="Cerca un servizio..."
              empty="Nessun servizio attivo trovato."
            />
          )}

          {/* ---- Passo 4: compilazione ---- */}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm sm:col-span-2">
                <p>
                  <span className="text-muted-foreground">Soggetto:</span> {personLabel(subject)}
                </p>
                <p>
                  <span className="text-muted-foreground">Immobile:</span> {property && propertyLabel(property)}
                </p>
                <p>
                  <span className="text-muted-foreground">Servizio:</span> {service?.name}
                </p>
              </div>
              <Field label="Nome pratica *" htmlFor="pr-name" className="sm:col-span-2">
                <Input
                  id="pr-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Tipo" htmlFor="pr-type">
                <Input
                  id="pr-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </Field>
              <Field label="Importo (€) *" htmlFor="pr-amount">
                <Input
                  id="pr-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </Field>

              <Field label="Descrizione" htmlFor="pr-desc" className="sm:col-span-2">
                <Textarea
                  id="pr-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Annulla
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={back} disabled={saving}>
                Indietro
              </Button>
            )}
            <Button onClick={next} disabled={saving}>
              {saving ? "Salvataggio..." : isLast ? "Aggiungi all'ordine" : "Avanti"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
