"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check } from "lucide-react"

import type { Client } from "@/types/client"
import type { Order } from "@/types/order"
import { ClientSelector } from "@/components/selectors/client-selector"
// TODO: adatta ai nomi reali delle chiamate
import { fetchOrders } from "@/api/orders"
import { createOrUpdatePayment } from "@/api/payments"

// ---------------------------------------------------------------------------
// Opzioni dei selettori (allinea i valori all'enum del backend)
// ---------------------------------------------------------------------------

const METHODS = [
  { value: "BANK_TRANSFER", label: "Bonifico" },
  { value: "CASH", label: "Contanti" },
  { value: "CARD", label: "Carta" },
  { value: "CHECK", label: "Assegno" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "SDD", label: "Addebito SEPA" },
]

const STATUSES = [
  { value: "COMPLETED", label: "Completato" },
  { value: "PENDING", label: "In attesa" },
]

const STEPS = ["Cliente", "Ordine", "Importo e data", "Dettagli"] as const

const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  PENDING: "In attesa",
  IN_PROGRESS: "In lavorazione",
  COMPLETED: "Completato",
  CANCELLED: "Annullato",
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const round2 = (v: number) => Math.round(v * 100) / 100

const eur = (v: unknown) =>
  `€ ${num(v).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (v?: string | null) => {
  if (!v) return "—"
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("it-IT")
}

/** Data odierna nel formato YYYY-MM-DD (fuso locale), come richiesto da <input type="date">. */
const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const clientName = (c?: Client | null) => {
  const x = c as any
  return x?.companyName || [x?.lastName, x?.firstName].filter(Boolean).join(" ") || "—"
}

const residualOf = (o: Order) => Math.max(num(o.totalAmount) - num(o.paidAmount), 0)

/** Estrae elementi e numero di pagine da { data: [...], meta: { pages } } (anche dentro una risposta axios). */
const extractPage = (res: any): { items: Order[]; pages: number } => {
  const body = Array.isArray(res?.data?.data) ? res.data : res
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
  const pages = Number(body?.meta?.pages ?? body?.meta?.totalPages ?? 1) || 1
  return { items, pages }
}

const PAGE_LIMIT = 100
const MAX_PAGES = 20

/** Ordini del cliente non pagati o pagati in parte. */
async function loadUnpaidOrders(clientId: string): Promise<Order[]> {
  const request = (page: number) =>
    fetchOrders({ clientId, unpaidOnly: true, page, limit: PAGE_LIMIT }).then(extractPage)

  const first = await request(1)
  const lastPage = Math.min(first.pages, MAX_PAGES)
  const rest = await Promise.all(Array.from({ length: Math.max(lastPage - 1, 0) }, (_, i) => request(i + 2)))

  // Sicurezza: tengo solo ordini del cliente, con residuo da incassare e non annullati
  return [...first.items, ...rest.flatMap((r) => r.items)].filter(
    (o) => String(o.clientId) === String(clientId) && o.status !== "CANCELLED" && residualOf(o) > 0.005,
  )
}

// ---------------------------------------------------------------------------
// Componenti di supporto
// ---------------------------------------------------------------------------

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
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
            {n < STEPS.length && <span className="h-px w-6 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
    </div>
  )
}

function OrderCard({
  order,
  selected,
  onSelect,
}: {
  order: Order
  selected: boolean
  onSelect: () => void
}) {
  const total = num(order.totalAmount)
  const paid = num(order.paidAmount)
  const paidPct = total > 0 ? Math.min((paid / total) * 100, 100) : 0
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">Ordine {order.code}</p>
          <p className="text-xs text-muted-foreground">
            {fmtDate(order.createdAt)}
            {order._count?.practices != null
              ? ` · ${order._count.practices} ${order._count.practices === 1 ? "pratica" : "pratiche"}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary">{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
              selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
            }`}
          >
            {selected && <Check className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label={`Pagato ${Math.round(paidPct)}%`}
        aria-valuenow={Math.round(paidPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
      </div>

      <div className="flex items-end justify-between text-sm">
        <span className="text-muted-foreground">
          Totale {eur(total)} · pagato {eur(paid)}
        </span>
        <span className="font-semibold">Residuo {eur(residualOf(order))}</span>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

export default function NewPaymentPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Passo 1-2
  const [client, setClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Passo 3-4
  const [amount, setAmount] = useState("")
  const [amountTouched, setAmountTouched] = useState(false)
  const [date, setDate] = useState(todayISO)
  const [method, setMethod] = useState("BANK_TRANSFER")
  const [status, setStatus] = useState("COMPLETED")

  // ---- Ordini del cliente selezionato ----
  const clientId = client ? String((client as any).id) : null

  useEffect(() => {
    setOrders([])
    setSelectedId(null)
    setAmountTouched(false)
    if (!clientId) return

    let cancelled = false
    setLoadingOrders(true)
    loadUnpaidOrders(clientId)
      .then((data) => !cancelled && setOrders(data))
      .catch((error) => {
        console.error("Errore nel caricamento degli ordini:", error)
        if (!cancelled) toast.error("Impossibile caricare gli ordini del cliente")
      })
      .finally(() => !cancelled && setLoadingOrders(false))
    return () => {
      cancelled = true
    }
  }, [clientId])

  // ---- Dati derivati ----
  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId])
  const residual = selectedOrder ? round2(residualOf(selectedOrder)) : 0

  // Cambiando ordine l'importo torna al residuo del nuovo ordine
  const selectOrder = (id: string) => {
    if (id === selectedId) return
    setSelectedId(id)
    setAmountTouched(false)
  }

  // Finché l'importo non viene modificato a mano, coincide con il residuo dell'ordine
  useEffect(() => {
    if (!amountTouched) setAmount(residual > 0 ? residual.toFixed(2) : "")
  }, [residual, amountTouched])

  const amountNum = Number(amount)
  const amountError =
    amount === "" || !Number.isFinite(amountNum) || amountNum <= 0
      ? "Inserisci un importo maggiore di zero."
      : amountNum > residual + 0.005
        ? `L'importo supera il residuo dell'ordine (${eur(residual)}).`
        : null

  const residualAfter = amountError ? residual : round2(residual - amountNum)

  const canProceed =
    (step === 1 && !!client) ||
    (step === 2 && !!selectedOrder) ||
    (step === 3 && !amountError && !!date) ||
    step === 4

  const methodLabel = METHODS.find((m) => m.value === method)?.label ?? method
  const statusLabel = STATUSES.find((s) => s.value === status)?.label ?? status

  const save = async () => {
    if (!client || !selectedOrder || amountError || !date || !method || !status) return
    setSaving(true)
    try {
      // TODO: adatta il payload al contratto reale dell'API

  

      await createOrUpdatePayment({
        clientId,
        date: new Date(`${date}T12:00:00`).toISOString(),
        amount: round2(amountNum),
        isRefund: false,
        status,
        method,
        orderId: selectedOrder.id ,
      } as any)
      toast.success("Pagamento registrato")
      router.push("/payments")
    } catch (error) {
      console.error("Errore nel salvataggio del pagamento:", error)
      toast.error("Errore nel salvataggio del pagamento")
      setSaving(false)
    }
  }

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
                  <BreadcrumbLink href="/payments">Pagamenti</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nuovo pagamento</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuovo pagamento</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Passo {step} di {STEPS.length}: {STEPS[step - 1]}
            </p>
          </div>

          <Stepper step={step} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Passo corrente */}
            <Card className="lg:col-span-2">
              <CardContent className="space-y-6 p-6">
                {/* 1. Cliente */}
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <CardTitle className="text-base">Cliente</CardTitle>
                      <CardDescription>Scegli il cliente che effettua il pagamento.</CardDescription>
                    </div>
                    {client && (
                      <p className="text-sm">
                        Selezionato: <strong>{clientName(client)}</strong>
                      </p>
                    )}
                    <ClientSelector onSelectClient={setClient} />
                  </div>
                )}

                {/* 2. Ordine */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-base">Ordine da pagare</CardTitle>
                      <CardDescription>
                        Ordini di {clientName(client)} non pagati o pagati in parte. Ogni pagamento riguarda un solo
                        ordine.
                      </CardDescription>
                    </div>

                    {loadingOrders ? (
                      <p className="py-10 text-center text-sm text-muted-foreground">Caricamento ordini...</p>
                    ) : orders.length === 0 ? (
                      <p className="py-10 text-center text-sm text-muted-foreground">
                        Questo cliente non ha ordini da pagare.
                      </p>
                    ) : (
                      <div
                        role="radiogroup"
                        aria-label="Ordine da pagare"
                        className="grid max-h-[28rem] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
                      >
                        {orders.map((o) => (
                          <OrderCard
                            key={o.id}
                            order={o}
                            selected={o.id === selectedId}
                            onSelect={() => selectOrder(o.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Importo e data */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <CardTitle className="text-base">Importo e data</CardTitle>
                      <CardDescription>
                        L&apos;importo parte dal residuo dell&apos;ordine e puoi modificarlo.
                      </CardDescription>
                    </div>

                    {selectedOrder && (
                      <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                        <span className="font-medium">Ordine {selectedOrder.code}</span>
                        <span className="text-muted-foreground">
                          totale {eur(selectedOrder.totalAmount)} · residuo{" "}
                          <strong className="text-foreground">{eur(residual)}</strong>
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pay-amount">Importo (€) *</Label>
                        <Input
                          id="pay-amount"
                          type="number"
                          min={0}
                          step="0.01"
                          value={amount}
                          aria-invalid={!!amountError}
                          className={amountError ? "border-destructive" : ""}
                          onChange={(e) => {
                            setAmountTouched(true)
                            setAmount(e.target.value)
                          }}
                        />
                        {amountError ? (
                          <p role="alert" className="text-sm text-destructive">
                            {amountError}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Residuo dell&apos;ordine: {eur(residual)}</p>
                        )}
                        {amountTouched && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => setAmountTouched(false)}
                          >
                            Ripristina il residuo ({eur(residual)})
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pay-date">Data del pagamento *</Label>
                        <Input id="pay-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        {date === todayISO() && <p className="text-xs text-muted-foreground">Oggi</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Dettagli */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <CardTitle className="text-base">Dettagli</CardTitle>
                      <CardDescription>Imposta metodo e stato, poi controlla il riepilogo e salva.</CardDescription>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pay-method">Metodo di pagamento *</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v ?? "")}>
                          <SelectTrigger id="pay-method" className="w-full">
                            <SelectValue placeholder="Seleziona un metodo">{methodLabel}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pay-status">Stato *</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
                          <SelectTrigger id="pay-status" className="w-full">
                            <SelectValue placeholder="Seleziona uno stato">{statusLabel}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <dl className="space-y-2">
                        <SummaryRow label="Ordine">{selectedOrder ? `Ordine ${selectedOrder.code}` : "—"}</SummaryRow>
                        <SummaryRow label="Residuo attuale">{eur(residual)}</SummaryRow>
                        <SummaryRow label="Importo del pagamento">
                          <span className="text-emerald-600">{amountError ? "—" : eur(amountNum)}</span>
                        </SummaryRow>
                        <Separator />
                        <SummaryRow label="Residuo dopo il pagamento">
                          {residualAfter <= 0.005 && !amountError ? (
                            <Badge variant="secondary">Ordine saldato</Badge>
                          ) : (
                            eur(residualAfter)
                          )}
                        </SummaryRow>
                      </dl>
                    </div>
                  </div>
                )}

                {/* Navigazione */}
                <div className="flex justify-between border-t pt-4">
                  {step === 1 ? (
                    <Button type="button" variant="ghost" onClick={() => router.push("/payments")} disabled={saving}>
                      Annulla
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
                      Indietro
                    </Button>
                  )}

                  {step < STEPS.length ? (
                    <Button type="button" disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
                      Avanti
                    </Button>
                  ) : (
                    <Button type="button" onClick={save} disabled={saving || !!amountError || !date}>
                      {saving ? "Salvataggio..." : "Salva pagamento"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Riepilogo */}
            <Card className="h-fit lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">Riepilogo</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <SummaryRow label="Cliente">{client ? clientName(client) : "—"}</SummaryRow>
                  <SummaryRow label="Ordine">{selectedOrder ? selectedOrder.code : "—"}</SummaryRow>
                  <SummaryRow label="Residuo">{selectedOrder ? eur(residual) : "—"}</SummaryRow>
                  <Separator />
                  <SummaryRow label="Importo">{amount && !amountError ? eur(amountNum) : "—"}</SummaryRow>
                  <SummaryRow label="Data">{date ? fmtDate(`${date}T12:00:00`) : "—"}</SummaryRow>
                  {step >= 4 && (
                    <>
                      <SummaryRow label="Metodo">{methodLabel}</SummaryRow>
                      <SummaryRow label="Stato">{statusLabel}</SummaryRow>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
