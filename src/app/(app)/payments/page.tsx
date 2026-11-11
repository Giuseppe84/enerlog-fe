"use client";
import { useState, useEffect, useMemo } from "react"
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
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Banknote, Clock, Receipt, RotateCcw, Search, Wallet } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import type { Payment } from "@/types/payment"
// TODO: adatta al nome reale della chiamata e ai suoi parametri
import { fetchPayments } from "@/api/payments"

import {
  Kpi,
  ListModal,
  PERIODS,
  PeriodSelector,
  RadialSummaryChart,
  TrendCard,
  periodStart,
  type PeriodKey,
} from "./chart-parts"

// ---------------------------------------------------------------------------
// Caricamento dati
// ---------------------------------------------------------------------------

/** Estrae elementi e numero di pagine da { data: [...], meta: { pages } } (anche dentro una risposta axios). */
const extractPage = (res: any): { items: Payment[]; pages: number } => {
  const body = Array.isArray(res?.data?.data) ? res.data : res
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
  const pages = Number(body?.meta?.pages ?? 1) || 1
  return { items, pages }
}

const PAGE_LIMIT = 100
const MAX_PAGES = 50

async function loadPayments(): Promise<Payment[]> {
  const request = (page: number) => fetchPayments({ page, limit: PAGE_LIMIT }).then(extractPage)

  const first = await request(1)
  const lastPage = Math.min(first.pages, MAX_PAGES)
  const rest = await Promise.all(Array.from({ length: Math.max(lastPage - 1, 0) }, (_, i) => request(i + 2)))
  return [...first.items, ...rest.flatMap((r) => r.items)]
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)

const eur = (v: unknown) =>
  `€ ${num(v).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (v?: string | null) => {
  if (!v) return "—"
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// I campi del tipo Payment sono dichiarati con String/Boolean: li normalizzo qui
const paymentDate = (p: Payment) => String(p.date ?? p.createdAt ?? "")
const amountOf = (p: Payment) => num(p.amount)
const isRefund = (p: Payment) => Boolean(p.isRefund)
const methodKey = (p: Payment) => String(p.method ?? "").toUpperCase() || "UNKNOWN"

const clientName = (c?: Payment["client"] | null) =>
  [c?.lastName, c?.firstName].filter(Boolean).join(" ") || "—"

// Stati: adatta questi elenchi ai valori reali di Payment.status.
// Gli stati non riconosciuti sono trattati come "in attesa".
const COMPLETED_STATUSES = ["COMPLETED", "PAID", "SUCCEEDED", "SUCCESS", "SETTLED"]
const FAILED_STATUSES = ["FAILED", "CANCELLED", "CANCELED", "REJECTED", "DECLINED", "EXPIRED"]

type StatusGroup = "completed" | "pending" | "failed"

const groupOf = (p: Payment): StatusGroup => {
  const s = String(p.status ?? "").toUpperCase()
  if (COMPLETED_STATUSES.includes(s)) return "completed"
  if (FAILED_STATUSES.includes(s)) return "failed"
  return "pending"
}

const GROUP_META: Record<StatusGroup, { label: string; badge: string }> = {
  completed: {
    label: "Completato",
    badge: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  pending: {
    label: "In attesa",
    badge: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  failed: {
    label: "Non riuscito",
    badge: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Contanti",
  BANK_TRANSFER: "Bonifico",
  TRANSFER: "Bonifico",
  CARD: "Carta",
  CREDIT_CARD: "Carta di credito",
  DEBIT_CARD: "Carta di debito",
  CHECK: "Assegno",
  CHEQUE: "Assegno",
  PAYPAL: "PayPal",
  SDD: "Addebito SEPA",
  UNKNOWN: "Non indicato",
}

const methodLabel = (key: string) => {
  if (METHOD_LABELS[key]) return METHOD_LABELS[key]
  const text = key.toLowerCase().replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ---------------------------------------------------------------------------
// Configurazioni dei grafici
// ---------------------------------------------------------------------------

const statusConfig = {
  completed: { label: "Completati", color: "#10b981" },
  pending: { label: "In attesa", color: "#fbbf24" },
  failed: { label: "Non riusciti", color: "#fb7185" },
} satisfies ChartConfig

const flowConfig = {
  income: { label: "Incassi", color: "#10b981" },
  refund: { label: "Rimborsi", color: "#fb7185" },
} satisfies ChartConfig

const methodChartConfig = {
  amount: { label: "Incassato", color: "#6366f1" },
} satisfies ChartConfig

const compactEuro = new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 })

type ModalKey = "completed" | "pending" | "failed" | "income" | "refund" | null
type StatusFilter = "ALL" | StatusGroup

// ---------------------------------------------------------------------------
// Righe
// ---------------------------------------------------------------------------

function PaymentRow({ payment }: { payment: Payment }) {
  const refund = isRefund(payment)
  const meta = GROUP_META[groupOf(payment)]
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{clientName(payment.client)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {fmtDate(paymentDate(payment))} · {methodLabel(methodKey(payment))}
          {refund ? " · Rimborso" : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className={`font-semibold ${refund ? "text-rose-600" : ""}`}>
          {refund ? "− " : ""}
          {eur(amountOf(payment))}
        </p>
        <Badge variant="outline" className={meta.badge}>
          {meta.label}
        </Badge>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

export default function Page() {
  const router = useRouter()

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const [period, setPeriod] = useState<PeriodKey>("6M")
  const [modal, setModal] = useState<ModalKey>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(25)

  useEffect(() => {
    let cancelled = false
    loadPayments()
      .then((data) => !cancelled && setPayments(data))
      .catch((error) => {
        console.error("Errore nel caricamento dei pagamenti:", error)
        toast.error("Impossibile caricare i pagamenti")
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Dati del periodo selezionato (per data del pagamento) ----
  const stats = useMemo(() => {
    const config = PERIODS.find((p) => p.key === period) ?? PERIODS[1]
    const from = periodStart(config.months)

    const inPeriod = payments
      .filter((p) => new Date(paymentDate(p)).getTime() >= from.getTime())
      .sort((a, b) => new Date(paymentDate(b)).getTime() - new Date(paymentDate(a)).getTime())

    const completed = inPeriod.filter((p) => groupOf(p) === "completed")
    const pending = inPeriod.filter((p) => groupOf(p) === "pending")
    const failed = inPeriod.filter((p) => groupOf(p) === "failed")

    const income = completed.filter((p) => !isRefund(p))
    const refund = completed.filter(isRefund)
    const incomeTotal = sum(income.map(amountOf))
    const refundTotal = sum(refund.map(amountOf))
    const pendingTotal = sum(pending.filter((p) => !isRefund(p)).map(amountOf))
    const refundPct = incomeTotal > 0 ? Math.round((refundTotal / incomeTotal) * 100) : 0
    const completedPct = inPeriod.length ? Math.round((completed.length / inPeriod.length) * 100) : 0

    // Andamento mensile di incassi e rimborsi
    const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()
    const byMonth = new Map<number, { income: number; refund: number }>()
    completed.forEach((p) => {
      const k = monthKey(new Date(paymentDate(p)))
      const m = byMonth.get(k) ?? { income: 0, refund: 0 }
      if (isRefund(p)) m.refund += amountOf(p)
      else m.income += amountOf(p)
      byMonth.set(k, m)
    })
    const lastKey = Math.max(monthKey(new Date()), ...byMonth.keys())
    const shortFmt = new Intl.DateTimeFormat("it-IT", { month: "short" })
    const longFmt = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" })
    const longRange = lastKey - monthKey(from) + 1 > 12
    const monthly: { label: string; fullLabel: string; income: number; refund: number }[] = []
    for (let k = monthKey(from); k <= lastKey; k++) {
      const d = new Date(Math.floor(k / 12), k % 12, 1)
      const m = byMonth.get(k) ?? { income: 0, refund: 0 }
      monthly.push({
        label: longRange ? `${shortFmt.format(d)} ${String(d.getFullYear()).slice(2)}` : shortFmt.format(d),
        fullLabel: longFmt.format(d),
        income: Math.round(m.income * 100) / 100,
        refund: Math.round(m.refund * 100) / 100,
      })
    }

    // Incassato per metodo di pagamento
    const methodMap = new Map<string, number>()
    income.forEach((p) => methodMap.set(methodKey(p), (methodMap.get(methodKey(p)) ?? 0) + amountOf(p)))
    const methods = [...methodMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, amount]) => ({ method: methodLabel(key), amount: Math.round(amount * 100) / 100 }))

    // Clienti con il maggior incassato netto
    const clientMap = new Map<string, { name: string; net: number; count: number }>()
    completed.forEach((p) => {
      const key = String(p.client?.id ?? clientName(p.client))
      const c = clientMap.get(key) ?? { name: clientName(p.client), net: 0, count: 0 }
      c.net += isRefund(p) ? -amountOf(p) : amountOf(p)
      c.count += 1
      clientMap.set(key, c)
    })
    const topClients = [...clientMap.values()].sort((a, b) => b.net - a.net).slice(0, 5)

    return {
      label: config.description,
      from: from.toISOString(),
      all: inPeriod,
      completed,
      pending,
      failed,
      income,
      refund,
      incomeTotal,
      refundTotal,
      netTotal: incomeTotal - refundTotal,
      pendingTotal,
      refundPct,
      completedPct,
      monthly,
      methods,
      topClients,
    }
  }, [payments, period])

  // ---- Tabella: filtri ----
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return stats.all.filter((p) => {
      if (statusFilter !== "ALL" && groupOf(p) !== statusFilter) return false
      if (!q) return true
      return `${clientName(p.client)} ${methodLabel(methodKey(p))}`.toLowerCase().includes(q)
    })
  }, [stats.all, statusFilter, search])

  const modalMap: Record<Exclude<ModalKey, null>, { title: string; items: Payment[]; empty: string }> = {
    completed: { title: "Pagamenti completati", items: stats.completed, empty: "Nessun pagamento completato nel periodo." },
    pending: { title: "Pagamenti in attesa", items: stats.pending, empty: "Nessun pagamento in attesa nel periodo." },
    failed: { title: "Pagamenti non riusciti", items: stats.failed, empty: "Nessun pagamento non riuscito nel periodo." },
    income: { title: "Incassi", items: stats.income, empty: "Nessun incasso nel periodo." },
    refund: { title: "Rimborsi", items: stats.refund, empty: "Nessun rimborso nel periodo." },
  }
  const modalData = modal ? modalMap[modal] : null

  const maxClient = Math.max(1, ...stats.topClients.map((c) => Math.abs(c.net)))

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  const statusChips: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "Tutti", count: stats.all.length },
    { key: "completed", label: "Completati", count: stats.completed.length },
    { key: "pending", label: "In attesa", count: stats.pending.length },
    { key: "failed", label: "Non riusciti", count: stats.failed.length },
  ]

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
                <BreadcrumbItem>
                  <BreadcrumbPage>Pagamenti</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          {/* Intestazione + periodo */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pagamenti</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Dal {fmtDate(stats.from)} · {stats.all.length} pagamenti nel periodo
              </p>
            </div>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          {/* Indicatori */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={Wallet}
              label="Incassato netto"
              value={eur(stats.netTotal)}
              hint="Incassi meno rimborsi"
            />
            <Kpi
              icon={Banknote}
              label="Incassi"
              value={eur(stats.incomeTotal)}
              hint={`${stats.income.length} pagamenti completati`}
            />
            <Kpi
              icon={RotateCcw}
              label="Rimborsi"
              value={eur(stats.refundTotal)}
              hint={`${stats.refund.length} rimborsi`}
            />
            <Kpi
              icon={Clock}
              label="In attesa"
              value={eur(stats.pendingTotal)}
              hint={`${stats.pending.length} pagamenti da completare`}
            />
          </div>

          {/* Grafici radiali */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TrendCard
              title="Stato dei pagamenti"
              description="Completati, in attesa e non riusciti"
              chart={
                <RadialSummaryChart
                  config={statusConfig}
                  values={{
                    completed: stats.completed.length,
                    pending: stats.pending.length,
                    failed: stats.failed.length,
                  }}
                  keys={["completed", "pending", "failed"]}
                  centerValue={`${stats.completedPct}%`}
                  centerLabel="completati"
                />
              }
              summary={
                stats.all.length
                  ? `${stats.completed.length} su ${stats.all.length} pagamenti completati (${stats.label}).`
                  : "Nessun pagamento nel periodo selezionato."
              }
              rows={[
                {
                  label: "Completati",
                  dot: "bg-emerald-500",
                  value: String(stats.completed.length),
                  onClick: () => setModal("completed"),
                },
                {
                  label: "In attesa",
                  dot: "bg-amber-400",
                  value: String(stats.pending.length),
                  hint: stats.pending.length ? eur(stats.pendingTotal) : undefined,
                  onClick: () => setModal("pending"),
                },
                {
                  label: "Non riusciti",
                  dot: "bg-rose-400",
                  value: String(stats.failed.length),
                  onClick: () => setModal("failed"),
                },
              ]}
            />

            <TrendCard
              title="Incassi e rimborsi"
              description="Importi dei pagamenti completati"
              chart={
                <RadialSummaryChart
                  config={flowConfig}
                  values={{ income: stats.incomeTotal, refund: stats.refundTotal }}
                  keys={["income", "refund"]}
                  centerValue={`${stats.refundPct}%`}
                  centerLabel="rimborsato"
                  formatValue={eur}
                />
              }
              summary={
                stats.incomeTotal + stats.refundTotal > 0
                  ? `Incassi ${eur(stats.incomeTotal)}, rimborsi ${eur(stats.refundTotal)}: netto ${eur(stats.netTotal)}.`
                  : "Nessun importo nel periodo selezionato."
              }
              rows={[
                {
                  label: "Incassi",
                  dot: "bg-emerald-500",
                  value: String(stats.income.length),
                  hint: eur(stats.incomeTotal),
                  onClick: () => setModal("income"),
                },
                {
                  label: "Rimborsi",
                  dot: "bg-rose-400",
                  value: String(stats.refund.length),
                  hint: stats.refund.length ? eur(stats.refundTotal) : undefined,
                  onClick: () => setModal("refund"),
                },
              ]}
            />
          </div>

          {/* Andamento mensile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Andamento mensile</CardTitle>
              <p className="text-sm text-muted-foreground">Incassi e rimborsi completati per mese ({stats.label})</p>
            </CardHeader>
            <CardContent>
              {stats.income.length + stats.refund.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nessun pagamento completato nel periodo selezionato.
                </p>
              ) : (
                <ChartContainer config={flowConfig} className="h-64 w-full">
                  <BarChart accessibilityLayer data={stats.monthly}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v) => `€${compactEuro.format(Number(v))}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                  style={{ backgroundColor: `var(--color-${String(name)})` }}
                                />
                                {flowConfig[name as keyof typeof flowConfig]?.label}
                              </span>
                              <span className="font-mono font-medium tabular-nums text-foreground">
                                {eur(Number(value))}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="refund" fill="var(--color-refund)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Metodi e clienti */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Incassato per metodo</CardTitle>
                <p className="text-sm text-muted-foreground">Solo incassi completati ({stats.label})</p>
              </CardHeader>
              <CardContent>
                {stats.methods.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">Nessun incasso nel periodo.</p>
                ) : (
                  <ChartContainer
                    config={methodChartConfig}
                    className="w-full"
                    style={{ height: Math.max(160, stats.methods.length * 44) }}
                  >
                    <BarChart accessibilityLayer data={stats.methods} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="method"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={100}
                      />
                      <XAxis type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, _name, item) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span>{item?.payload?.method}</span>
                                <span className="font-mono font-medium tabular-nums text-foreground">
                                  {eur(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={4} maxBarSize={24} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Clienti principali</CardTitle>
                <p className="text-sm text-muted-foreground">Incassato netto nel periodo ({stats.label})</p>
              </CardHeader>
              <CardContent>
                {stats.topClients.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">Nessun pagamento completato.</p>
                ) : (
                  <ul className="space-y-4">
                    {stats.topClients.map((c) => (
                      <li key={c.name} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-medium">{c.name}</span>
                          <span className="shrink-0 font-semibold">{eur(c.net)}</span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`Incassato ${c.name}`}
                          aria-valuenow={Math.round((Math.abs(c.net) / maxClient) * 100)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="h-2 w-full overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(Math.max(c.net, 0) / maxClient) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {c.count} {c.count === 1 ? "pagamento" : "pagamenti"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Elenco pagamenti */}
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" /> Elenco pagamenti
                <Badge variant="secondary">{filtered.length}</Badge>
              </CardTitle>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {statusChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      aria-pressed={statusFilter === chip.key}
                      onClick={() => {
                        setStatusFilter(chip.key)
                        setVisibleCount(25)
                      }}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        statusFilter === chip.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {chip.label} · {chip.count}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setVisibleCount(25)
                    }}
                    placeholder="Cerca cliente o metodo..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nessun pagamento da mostrare.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Metodo</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.slice(0, visibleCount).map((p) => {
                        const meta = GROUP_META[groupOf(p)]
                        const refund = isRefund(p)
                        const orderId = p.orders?.id
                        return (
                          <TableRow
                            key={String(p.id)}
                            className={orderId ? "cursor-pointer" : undefined}
                            onClick={orderId ? () => router.push(`/orders/${orderId}`) : undefined}
                          >
                            <TableCell>{fmtDate(paymentDate(p))}</TableCell>
                            <TableCell className="font-medium">{clientName(p.client)}</TableCell>
                            <TableCell>{methodLabel(methodKey(p))}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className={meta.badge}>
                                  {meta.label}
                                </Badge>
                                {refund && <Badge variant="secondary">Rimborso</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right ${refund ? "text-rose-600" : ""}`}>
                              {refund ? "− " : ""}
                              {eur(amountOf(p))}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  {filtered.length > visibleCount && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={() => setVisibleCount((n) => n + 25)}>
                        Mostra altri {Math.min(25, filtered.length - visibleCount)}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modale: pagamenti di riferimento */}
        <ListModal
          open={modal !== null}
          onOpenChange={(open) => !open && setModal(null)}
          title={modalData?.title ?? ""}
          description={`${modalData?.items.length ?? 0} pagamenti · ${stats.label}`}
          empty={modalData?.empty ?? ""}
          isEmpty={!modalData || modalData.items.length === 0}
        >
          {modalData?.items.map((p) => <PaymentRow key={String(p.id)} payment={p} />)}
        </ListModal>
      </SidebarInset>
    </SidebarProvider>
  )
}
