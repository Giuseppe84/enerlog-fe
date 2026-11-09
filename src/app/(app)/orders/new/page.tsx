"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, UserPlus } from "lucide-react"
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
import type { Service } from "@/types/service"
import type { Client } from "@/types/client"

// ---------------------------------------------------------------------------
// TODO: adatta ai nomi reali delle tue API (stessi dei file del wizard).
// ---------------------------------------------------------------------------
import { fetchServices } from "@/api/services"
import { createOrUpdateOrder } from "@/api/orders"

import { personLabel, formatEuro, toArray } from "./WizardParts"
import { ClientSelectDialog } from "./client-select-dialog"
import { PracticeWizardDialog } from "./practice-wizard-dialog"
import { propertyCadastral, propertyLabel, type PracticeDraft } from "./order-utils"

/** Sezione numerata con titolo, descrizione e riepilogo opzionale. */
function StepCard({
  number,
  title,
  description,
  summary,
  children,
}: {
  number: number
  title: string
  description: string
  summary?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
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
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function NewOrderPage() {
  const router = useRouter()

  // Dati di elenco
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  // Ordine
  const [client, setClient] = useState<Client | null>(null)
  const [drafts, setDrafts] = useState<PracticeDraft[]>([])
  const [saving, setSaving] = useState(false)

  // Dialog
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const total = useMemo(() => drafts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0), [drafts])

  // ---- Caricamenti ----
  useEffect(() => {
    let cancelled = false
    fetchServices()
      .then((d: any) => !cancelled && setServices(toArray<Service>(d).filter((s) => s.isActive)))
      .catch(() => toast.error("Impossibile caricare i servizi"))
      .finally(() => !cancelled && setLoadingServices(false))
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
  const openWizard = () => {
    if (!client) return toast.error("Seleziona prima un cliente")
    setWizardOpen(true)
  }

  const addPractice = (practice: Omit<PracticeDraft, "key">) => {
    setDrafts((prev) => [...prev, { ...practice, key: crypto.randomUUID() }])
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

        <ClientSelectDialog
          open={clientDialogOpen}
          onOpenChange={setClientDialogOpen}
          onSelectClient={setClient}
        />

        <PracticeWizardDialog
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          client={client}
          services={services}
          loadingServices={loadingServices}
          onAdd={addPractice}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
