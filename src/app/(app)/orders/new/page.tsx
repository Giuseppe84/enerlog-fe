"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Briefcase,
  type LucideIcon,
} from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import type { Property, CadastralData } from "@/types/property"
import { ClientSelector } from "@/components/selectors/client-selector"
import { SubjectSelector } from "@/components/selectors/subject-selector"
import { PropertySelector } from "@/components/selectors/property-selector"

// ---------------------------------------------------------------------------
// TODO: adatta ai nomi reali delle tue API (stessi dei file del wizard).
// ---------------------------------------------------------------------------
import { fetchClients } from "@/api/clients"
import { fetchServices } from "@/api/services"
import { createOrUpdateOrder } from "@/api/orders"

import { Field, personLabel, formatEuro, toArray } from "./WizardParts"

// ---------- Tipi locali ----------

interface PracticeDraft {
  key: string
  subject: Subject
  property: Property
  service: Service
  name: string
  description: string
  type: string
  amount: string
  startDate: string | null
  endDate: string | null
}

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

const emptyForm = { name: "", description: "", type: "GENERIC", amount: "", startDate: "", endDate: "" }

const WIZARD_STEPS = ["Soggetto", "Immobile", "Servizio", "Dati pratica"] as const

const cadastralLabel = (c: CadastralData) =>
  [
    c.sheet && `Fg. ${c.sheet}`,
    c.parcel && `Part. ${c.parcel}`,
    c.subaltern && `Sub. ${c.subaltern}`,
    c.category && `Cat. ${c.category}`,
  ]
    .filter(Boolean)
    .join(" ")

// Più righe catastali: le unisco con " · "
const propertyCadastral = (p?: Property | null) =>
  (p?.cadastralData ?? []).map(cadastralLabel).filter(Boolean).join(" · ")

const propertyLabel = (p?: Property | null) => {
  if (!p) return "Nessun immobile"
  const address = [p.address, p.city].filter(Boolean).join(", ")
  return address || p.name || "Immobile senza indirizzo"
}

// ---------- Componenti di supporto ----------

/** Sezione numerata; resta bloccata finché il passo precedente non è completo. */
function StepCard({
  number,
  title,
  description,
  locked,
  summary,
  action,
  children,
}: {
  number: number
  title: string
  description: string
  locked?: boolean
  summary?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className={locked ? "pointer-events-none opacity-50" : undefined} aria-disabled={locked}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
            {number}
          </span>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            {summary && <div className="mt-2 text-sm">{summary}</div>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

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

// ---------- Pagina ----------

export default function NewOrderPage() {
  const router = useRouter()

  // Dati di elenco
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState({ clients: true, services: true })

  // Selezioni
  const [client, setClient] = useState<Client | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  // Dialog
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Pratiche dell'ordine
  const [drafts, setDrafts] = useState<PracticeDraft[]>([])
  const [saving, setSaving] = useState(false)

  const total = useMemo(() => drafts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0), [drafts])

  // ---- Caricamenti ----
  useEffect(() => {
    let cancelled = false
    const done = (key: keyof typeof loading) => () =>
      !cancelled && setLoading((l) => ({ ...l, [key]: false }))

    fetchClients()
      .then((d: any) => !cancelled && setClients(toArray<Client>(d)))
      .catch(() => toast.error("Impossibile caricare i clienti"))
      .finally(done("clients"))
    fetchServices()
      .then((d: any) => !cancelled && setServices(toArray<Service>(d).filter((s) => s.isActive)))
      .catch(() => toast.error("Impossibile caricare i servizi"))
      .finally(done("services"))

    return () => {
      cancelled = true
    }
  }, [])

  // Avviso se si lascia la pagina con pratiche non salvate
  useEffect(() => {
    if (drafts.length === 0) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [drafts.length])

  // ---- Azioni ----
  const resetPractice = () => {
    setSubject(null)
    setProperty(null)
    setService(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const openWizard = () => {
    if (!client) return toast.error("Seleziona prima un cliente")
    resetPractice()
    setWizardStep(1)
    setWizardOpen(true)
  }

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
    (wizardStep === 1 && !!subject) ||
    (wizardStep === 2 && !!property) ||
    (wizardStep === 3 && !!service) ||
    wizardStep === 4

  const addPractice = () => {
    setFormError(null)
    if (!subject || !property || !service) return
    if (!form.name.trim()) return setFormError("Inserisci il nome della pratica.")
    if (form.amount === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) < 0) {
      return setFormError("Inserisci un importo valido.")
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setFormError("La data di fine non può precedere quella di inizio.")
    }

    setDrafts((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        subject,
        property,
        service,
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type || "GENERIC",
        amount: String(Number(form.amount)),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      },
    ])

    setWizardOpen(false)
    resetPractice()
    toast.success("Pratica aggiunta all'ordine")
  }

  const updateAmount = (key: string, value: string) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, amount: value } : d)))

  const removeDraft = (key: string) => setDrafts((prev) => prev.filter((d) => d.key !== key))

  const submitOrder = async () => {
    if (!client) return toast.error("Seleziona un cliente")
    if (drafts.length === 0) return toast.error("Aggiungi almeno una pratica")
    if (drafts.some((d) => d.amount === "" || !Number.isFinite(Number(d.amount)) || Number(d.amount) < 0)) {
      return toast.error("Controlla gli importi delle pratiche")
    }

    const clientId = String((client as any).id)

    setSaving(true)
    try {
      const order: any = await createOrUpdateOrder({
        clientId,
        totalAmount: total,
        practices: drafts.map((d) => ({
          clientId,
          subjectId: d.subject.id,
          propertyId: d.property.id,
          serviceId: d.service.id,
          name: d.name,
          description: d.description,
          type: d.type,
          amount: String(Number(d.amount)),
          startDate: d.startDate,
          endDate: d.endDate,
        })),
      } as any)
      toast.success("Ordine creato")
      setDrafts([]) // evita l'avviso di uscita
      router.push(`/orders/${order?.id ?? ""}`)
    } catch {
      toast.error("Errore nella creazione dell'ordine")
      setSaving(false)
    }
  }

  const clientLabel = (c: Client) => personLabel(c as any)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/orders">Ordini</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nuovo ordine</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <h1 className="text-3xl font-bold tracking-tight">Nuovo ordine</h1>

          {/* 1. Cliente */}
          <StepCard
            number={1}
            title="Cliente"
            description="Scegli il cliente a cui intestare l'ordine."
            summary={client ? <>Selezionato: <strong>{clientLabel(client)}</strong></> : undefined}
          >
            <Button
              type="button"
              variant={client ? "outline" : "default"}
              className="gap-2"
              disabled={drafts.length > 0}
              title={drafts.length > 0 ? "Rimuovi le pratiche per cambiare cliente" : undefined}
              onClick={() => setClientDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              {client ? "Cambia cliente" : "Seleziona cliente"}
            </Button>
          </StepCard>

          {/* Riepilogo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riepilogo ordine</CardTitle>
              <CardDescription>
                {client ? `Cliente: ${clientLabel(client)}` : "Seleziona un cliente per poter creare l'ordine."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pratica</TableHead>
                    <TableHead>Soggetto</TableHead>
                    <TableHead>Immobile</TableHead>
                    <TableHead>Servizio</TableHead>
                    <TableHead className="w-40 text-right">Importo (€)</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Nessuna pratica aggiunta.
                      </TableCell>
                    </TableRow>
                  )}

                  {drafts.map((d) => (
                    <TableRow key={d.key}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{personLabel(d.subject as any)}</TableCell>
                      <TableCell>
                        <div>{propertyLabel(d.property)}</div>
                        {propertyCadastral(d.property) && (
                          <div className="text-xs text-muted-foreground">{propertyCadastral(d.property)}</div>
                        )}
                      </TableCell>
                      <TableCell>{d.service.name}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={d.amount}
                          onChange={(e) => updateAmount(d.key, e.target.value)}
                          className="ml-auto h-8 w-32 text-right"
                          aria-label={`Importo ${d.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Rimuovi ${d.name}`}
                          onClick={() => removeDraft(d.key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Ultima riga: aggiungi una nuova pratica */}
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full gap-2 border border-dashed text-muted-foreground"
                        onClick={openWizard}
                      >
                        <Plus className="h-4 w-4" /> Aggiungi pratica
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Totale ordine ({drafts.length} {drafts.length === 1 ? "pratica" : "pratiche"})
                    </TableCell>
                    <TableCell className="text-right text-base font-semibold">{formatEuro(total)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>

              <div className="mt-4 flex justify-between">
                <Button type="button" variant="ghost" onClick={() => router.push("/orders")} disabled={saving}>
                  Annulla
                </Button>
                <Button type="button" onClick={submitOrder} disabled={saving || !client || drafts.length === 0}>
                  {saving ? "Creazione..." : "Crea ordine"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog: selezione cliente */}
        <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Seleziona cliente</DialogTitle>
              <DialogDescription>Scegli il cliente a cui intestare l&apos;ordine.</DialogDescription>
            </DialogHeader>
            <ClientSelector
              onSelectClient={(c) => {
                setClient(c)
                setClientDialogOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog wizard: nuova pratica */}
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuova pratica</DialogTitle>
              <DialogDescription>
                Passo {wizardStep} di {WIZARD_STEPS.length}: {WIZARD_STEPS[wizardStep - 1]}
              </DialogDescription>
            </DialogHeader>

            <WizardStepper step={wizardStep} />

            <div className="min-h-64 py-2">
              {wizardStep === 1 && (
                <div className="space-y-3">
                  {subject && (
                    <p className="text-sm">
                      Selezionato: <strong>{personLabel(subject as any)}</strong>
                    </p>
                  )}
                  <SubjectSelector client={client ?? undefined} onSelectSubject={selectSubject} />
                </div>
              )}

              {wizardStep === 2 && (
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

              {wizardStep === 3 && (
                <CardPicker<Service>
                  items={services}
                  loading={loading.services}
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

              {wizardStep === 4 && (
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
              {wizardStep === 1 ? (
                <Button type="button" variant="ghost" onClick={() => setWizardOpen(false)}>
                  Annulla
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setWizardStep((s) => s - 1)}>
                  Indietro
                </Button>
              )}

              {wizardStep < WIZARD_STEPS.length ? (
                <Button type="button" disabled={!canProceed} onClick={() => setWizardStep((s) => s + 1)}>
                  Avanti
                </Button>
              ) : (
                <Button type="button" className="gap-2" onClick={addPractice}>
                  <Plus className="h-4 w-4" /> Aggiungi all&apos;ordine
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
