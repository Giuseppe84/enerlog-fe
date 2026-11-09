"use client"

import { useEffect, useMemo, useState } from "react"
import { Briefcase, Check, Plus, Search, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Service } from "@/types/service"
import type { Client } from "@/types/client"
import type { Subject } from "@/types/subject"
import type { Property } from "@/types/property"
import { SubjectSelector } from "@/components/selectors/subject-selector"
import { PropertySelector } from "@/components/selectors/property-selector"

import { Field, personLabel, formatEuro } from "./WizardParts"
import { propertyCadastral, propertyLabel, type PracticeDraft } from "./order-utils"

// Valori accettati dall'API per il campo "type" della pratica
const PRACTICE_TYPES = [
  { value: "GENERIC", label: "Generica" },
  { value: "CONTO_TERMICO", label: "Conto Termico" },
  { value: "APE", label: "APE" },
  { value: "FV_CONNESSIONE", label: "FV connessione" },
  { value: "ENEA", label: "ENEA" },
  { value: "L10", label: "L10" },
  { value: "PG_EL", label: "PG_EL" },
  { value: "PG_CL", label: "PG_CL" },
  { value: "PT_MET", label: "PT_MET" },
] as const

const WIZARD_STEPS = ["Soggetto", "Immobile", "Servizio", "Dati pratica"] as const

const emptyForm = { name: "", description: "", type: "GENERIC", amount: "", startDate: "", endDate: "" }

// ---------- Componenti di supporto ----------

/** Griglia di card selezionabili con ricerca. */
function CardPicker<T>({
  items,
  loading,
  selectedId,
  icon: Icon,
  getId,
  getTitle,
  getSubtitle,
  onSelect,
  placeholder,
  empty,
}: {
  items: T[]
  loading?: boolean
  selectedId?: string | null
  icon: LucideIcon
  getId: (item: T) => string
  getTitle: (item: T) => string
  getSubtitle?: (item: T) => string | undefined
  onSelect: (item: T) => void
  placeholder: string
  empty: string
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((i) => `${getTitle(i)} ${getSubtitle?.(i) ?? ""}`.toLowerCase().includes(q))
  }, [items, query, getTitle, getSubtitle])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Caricamento...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {filtered.map((item) => {
            const id = getId(item)
            const selected = id === selectedId
            const subtitle = getSubtitle?.(item)
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(item)}
                aria-pressed={selected}
                className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{getTitle(item)}</span>
                  {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>}
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Indicatore dei passi del wizard. */
function WizardStepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {WIZARD_STEPS.map((label, i) => {
        const n = i + 1
        const active = n === step
        const done = n < step
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-primary text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : n}
            </span>
            <span className={active ? "font-medium" : "hidden text-muted-foreground sm:inline"}>{label}</span>
            {n < WIZARD_STEPS.length && <span className="h-px w-6 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

// ---------- Dialog ----------

interface PracticeWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  services: Service[]
  loadingServices?: boolean
  /** Chiamata con la pratica completata; il dialog si chiude da solo. */
  onAdd: (practice: Omit<PracticeDraft, "key">) => void
}

/** Wizard a 4 passi: soggetto, immobile, servizio, dati della pratica. */
export function PracticeWizardDialog({
  open,
  onOpenChange,
  client,
  services,
  loadingServices,
  onAdd,
}: PracticeWizardDialogProps) {
  const [step, setStep] = useState(1)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  // Ogni apertura riparte da zero
  useEffect(() => {
    if (!open) return
    setStep(1)
    setSubject(null)
    setProperty(null)
    setService(null)
    setForm(emptyForm)
    setFormError(null)
  }, [open])

  const selectSubject = (s: Subject) => {
    if (s.id !== subject?.id) {
      setProperty(null)
      setService(null)
      setForm(emptyForm)
    }
    setSubject(s)
  }

  const selectService = (s: Service) => {
    setService(s)
    // Precompila solo i campi ancora vuoti
    setForm((f) => ({
      ...f,
      name: f.name || s.name,
      amount: f.amount || String(s.price ?? ""),
      description: f.description || s.description || "",
    }))
  }

  const canProceed =
    (step === 1 && !!subject) || (step === 2 && !!property) || (step === 3 && !!service) || step === 4

  const submit = () => {
    setFormError(null)
    if (!subject || !property || !service) return
    if (!form.name.trim()) return setFormError("Inserisci il nome della pratica.")
    if (form.amount === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) < 0) {
      return setFormError("Inserisci un importo valido.")
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setFormError("La data di fine non può precedere quella di inizio.")
    }

    onAdd({
      subject,
      property,
      service,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type || "GENERIC",
      amount: String(Number(form.amount)),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuova pratica</DialogTitle>
          <DialogDescription>
            Passo {step} di {WIZARD_STEPS.length}: {WIZARD_STEPS[step - 1]}
          </DialogDescription>
        </DialogHeader>

        <WizardStepper step={step} />

        <div className="min-h-64 py-2">
          {step === 1 && (
            <div className="space-y-3">
              {subject && (
                <p className="text-sm">
                  Selezionato: <strong>{personLabel(subject as any)}</strong>
                </p>
              )}
              <SubjectSelector client={client ?? undefined} onSelectSubject={selectSubject} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {property && (
                <div className="text-sm">
                  Selezionato: <strong>{propertyLabel(property)}</strong>
                  {propertyCadastral(property) && (
                    <div className="text-xs text-muted-foreground">{propertyCadastral(property)}</div>
                  )}
                </div>
              )}
              <PropertySelector
                subject={subject ?? undefined}
                skipCloseOnSelect={true}
                onSelectProperty={setProperty}
              />
            </div>
          )}

          {step === 3 && (
            <CardPicker<Service>
              items={services}
              loading={loadingServices}
              selectedId={service ? String((service as any).id) : null}
              icon={Briefcase}
              getId={(s) => String((s as any).id)}
              getTitle={(s) => s.name}
              getSubtitle={(s) => (s.price != null ? formatEuro(Number(s.price)) : undefined)}
              onSelect={selectService}
              placeholder="Cerca un servizio..."
              empty="Nessun servizio attivo."
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              {subject && property && service && (
                <p className="text-sm text-muted-foreground">
                  {personLabel(subject as any)} · {propertyLabel(property)} · {service.name}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome pratica *" htmlFor="pr-name" className="sm:col-span-2">
                  <Input id="pr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Tipo *" htmlFor="pr-type">
                  <select
                    id="pr-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {PRACTICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
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
                <Field label="Data inizio" htmlFor="pr-start">
                  <Input id="pr-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </Field>
                <Field label="Data fine" htmlFor="pr-end">
                  <Input id="pr-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </Field>
                <Field label="Descrizione" htmlFor="pr-desc" className="sm:col-span-2">
                  <Textarea id="pr-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Field>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {step === 1 ? (
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Indietro
            </Button>
          )}

          {step < WIZARD_STEPS.length ? (
            <Button type="button" disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
              Avanti
            </Button>
          ) : (
            <Button type="button" className="gap-2" onClick={submit}>
              <Plus className="h-4 w-4" /> Aggiungi all&apos;ordine
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
