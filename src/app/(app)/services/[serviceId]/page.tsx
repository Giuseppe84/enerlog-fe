"use client";
import { useState, useEffect, useMemo, type ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  MoreVertical,
  Pencil,
  Trash2,
  Info,
  Hourglass,
  CheckCircle2,
  Wallet,
  Clock,
  TrendingUp,
  Landmark,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import type { Service } from "@/types/service"
import type { Practice } from "@/types/practices"
import { fetchServiceById } from "@/api/services"
// TODO: adatta al nome reale della chiamata. Va aggiunto `serviceId?: string`
// a PracticesFilter e gestito dal backend (in ogni caso sotto si filtra di nuovo per sicurezza).
import { fetchPractices } from "@/api/practices"
import { ServiceModal } from "@/components/forms/ServiceFormModal"

// La risposta dell'API ha `serviceId` ma non l'oggetto `service` annidato
type ServicePractice = Practice & { serviceId?: string | null }

type ModalKey =
  | "info"
  | "all"
  | "inProgress"
  | "completed"
  | "paid"
  | "pending"
  | "chartCompleted"
  | "chartToComplete"
  | "chartPaid"
  | "chartUnpaid"
  | null

type PeriodKey = "3M" | "6M" | "1Y" | "5Y"

const PERIODS: { key: PeriodKey; label: string; months: number; description: string }[] = [
  { key: "3M", label: "3 mesi", months: 3, description: "ultimi 3 mesi" },
  { key: "6M", label: "6 mesi", months: 6, description: "ultimi 6 mesi" },
  { key: "1Y", label: "1 anno", months: 12, description: "ultimo anno" },
  { key: "5Y", label: "5 anni", months: 60, description: "ultimi 5 anni" },
]

const periodStart = (months: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

/** Quota di importo di una pratica, ripartita dai dati dell'ordine. */
interface PracticeShare {
  practice: Practice
  amount: number
  orderPaidPct: number
}

// ---------- Utility ----------

const num = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const formatEuro = (value: number | null | undefined) =>
  `€ ${Number(value || 0).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("it-IT") : "—"

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)

// Stati considerati "conclusa" / "annullata". Adatta ai valori reali di Practice.status
const COMPLETED_STATUSES = ["COMPLETED", "DONE", "CLOSED"]
const CANCELLED_STATUSES = ["CANCELLED", "CANCELED"]

const statusOf = (p: Practice) => String(p.status ?? "").toUpperCase()
const isCompleted = (p: Practice) => COMPLETED_STATUSES.includes(statusOf(p))
const isCancelled = (p: Practice) => CANCELLED_STATUSES.includes(statusOf(p))
const isDraft = (p: Practice) => statusOf(p) === "DRAFT"

const subjectName = (s?: Practice["subject"] | null) =>
  s?.companyName || [s?.lastName, s?.firstName].filter(Boolean).join(" ") || ""

const propertyName = (p?: Practice["property"] | null) =>
  [p?.address, p?.city].filter(Boolean).join(", ")

/**
 * Estrae elementi e numero di pagine da una risposta { data: [...], meta: { pages } }.
 * Funziona sia con il body diretto sia con la risposta axios (body in `.data`).
 */
const extractPage = (res: any): { items: ServicePractice[]; pages: number } => {
  const body = Array.isArray(res?.data?.data) ? res.data : res
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
  const pages = Number(body?.meta?.pages ?? 1) || 1
  return { items, pages }
}

const PAGE_LIMIT = 100
const MAX_PAGES = 50

/** Scarica tutte le pagine di pratiche del servizio. */
async function loadServicePractices(serviceId: string): Promise<ServicePractice[]> {
  const request = (page: number) =>
    fetchPractices({ query: "", serviceId, page, limit: PAGE_LIMIT }).then(extractPage)

  const first = await request(1)
  const lastPage = Math.min(first.pages, MAX_PAGES)
  const rest = await Promise.all(Array.from({ length: Math.max(lastPage - 1, 0) }, (_, i) => request(i + 2)))

  return [...first.items, ...rest.flatMap((r) => r.items)]
}

// L'ordine contiene solo il pagato totale: lo ripartisco sulle pratiche in proporzione al loro importo.
const orderPaidPct = (p: Practice) => {
  const total = num(p.order?.totalAmount)
  return total > 0 ? Math.min(num(p.order?.paidAmount) / total, 1) : 0
}
const paidShareOf = (p: Practice) => num(p.amount) * orderPaidPct(p)
const dueShareOf = (p: Practice) => Math.max(num(p.amount) - paidShareOf(p), 0)

// ---------- Componenti di supporto ----------

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-4 text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </>
  )

  const base = "rounded-xl border bg-card p-5 text-left shadow-sm"
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${base} transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  )
}

function ListModal({
  open,
  onOpenChange,
  title,
  description,
  empty,
  isEmpty,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  empty: string
  isEmpty: boolean
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isEmpty ? (
          <p className="py-8 text-center text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-3 pt-2">{children}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{children || "—"}</dd>
    </div>
  )
}

function practiceDateLabel(p: Practice) {
  if (isCompleted(p)) return `Conclusa il ${formatDate(p.endDate ?? p.updatedAt)}`
  if (isDraft(p)) return `Bozza creata il ${formatDate(p.createdAt)}`
  return `Avviata il ${formatDate(p.startDate ?? p.createdAt)}`
}

function PracticeRow({ practice }: { practice: Practice }) {
  const subject = subjectName(practice.subject)
  const property = propertyName(practice.property)
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{practice.name || `Pratica ${practice.id}`}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {[subject, property].filter(Boolean).join(" · ")}
          {subject || property ? " · " : ""}
          {practiceDateLabel(practice)}
        </p>
      </div>
      <p className="shrink-0 font-semibold">{formatEuro(num(practice.amount))}</p>
    </div>
  )
}

function ShareRow({ share, tone }: { share: PracticeShare; tone: string }) {
  const { practice, amount, orderPaidPct } = share
  const subject = [subjectName(practice.subject), propertyName(practice.property)].filter(Boolean).join(" · ")
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{practice.name || `Pratica ${practice.id}`}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {subject ? `${subject} · ` : ""}
          ordine pagato al {Math.round(orderPaidPct * 100)}% · importo pratica {formatEuro(num(practice.amount))}
        </p>
      </div>
      <p className={`shrink-0 font-semibold ${tone}`}>{formatEuro(amount)}</p>
    </div>
  )
}

// ---------- Grafici (shadcn/ui chart + Recharts) ----------

const completionConfig = {
  completed: { label: "Completate", color: "#10b981" },
  toComplete: { label: "Da completare", color: "#fbbf24" },
} satisfies ChartConfig

const paymentConfig = {
  collected: { label: "Incassato", color: "#10b981" },
  outstanding: { label: "Insoluto", color: "#fb7185" },
} satisfies ChartConfig

const monthlyConfig = {
  completed: { label: "Completate", color: "#10b981" },
  toComplete: { label: "Da completare", color: "#fbbf24" },
} satisfies ChartConfig

/** Grafico radiale ad anello con segmenti impilati, valore al centro e tooltip. */
function RadialSummaryChart({
  config,
  values,
  keys,
  centerValue,
  centerLabel,
  formatValue = (v) => String(v),
}: {
  config: ChartConfig
  values: Record<string, number>
  keys: string[]
  centerValue: string
  centerLabel: string
  formatValue?: (value: number) => string
}) {
  const total = keys.reduce((acc, k) => acc + (values[k] || 0), 0)

  if (total <= 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Nessun dato nel periodo
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="mx-auto h-44 w-44">
      <RadialBarChart data={[values]} startAngle={90} endAngle={-270} innerRadius={62} outerRadius={84}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: `var(--color-${String(name)})` }}
                    />
                    {config[String(name)]?.label}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatValue(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 4} className="fill-foreground text-2xl font-bold">
                      {centerValue}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-xs">
                      {centerLabel}
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </PolarRadiusAxis>
        {keys.map((k) => (
          <RadialBar
            key={k}
            dataKey={k}
            stackId="a"
            cornerRadius={4}
            fill={`var(--color-${k})`}
            className="stroke-transparent stroke-2"
          />
        ))}
      </RadialBarChart>
    </ChartContainer>
  )
}

interface TrendRow {
  label: string
  dot: string // classe Tailwind bg-*
  value: string
  hint?: string
  onClick: () => void
}

/** Card con grafico radiale, riepilogo e link che aprono l'elenco delle pratiche. */
function TrendCard({
  title,
  description,
  chart,
  summary,
  rows,
}: {
  title: string
  description: string
  chart: ReactNode
  summary: string
  rows: TrendRow[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {chart}
        <p className="text-center text-sm text-muted-foreground">{summary}</p>
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={row.onClick}
              className="group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.dot}`} />
                <span className="font-medium">{row.label}</span>
                {row.hint && <span className="truncate text-xs text-muted-foreground">{row.hint}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1 font-semibold">
                {row.value}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface MonthBucket {
  key: number // anno * 12 + mese
  date: string // primo giorno del mese (ISO)
  completed: number
  toComplete: number
  total: number
}

/** Barre impilate: numero di pratiche create per ogni mese (completate + da completare). */
function MonthlyBars({ data, periodLabel }: { data: MonthBucket[]; periodLabel: string }) {
  const total = data.reduce((acc, m) => acc + m.total, 0)
  const long = data.length > 12

  const shortFmt = new Intl.DateTimeFormat("it-IT", { month: "short" })
  const longFmt = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" })

  const chartData = data.map((m) => {
    const d = new Date(m.date)
    return {
      label: long ? `${shortFmt.format(d)} ${String(d.getFullYear()).slice(2)}` : shortFmt.format(d),
      fullLabel: longFmt.format(d),
      completed: m.completed,
      toComplete: m.toComplete,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pratiche per mese</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pratiche create ogni mese ({periodLabel}) · {total} in totale
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nessuna pratica nel periodo selezionato.</p>
        ) : (
          <ChartContainer config={monthlyConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" maxBarSize={32} />
              <Bar
                dataKey="toComplete"
                stackId="a"
                fill="var(--color-toComplete)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Pagina ----------

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const { serviceId } = useParams<{ serviceId: string }>()

  const [service, setService] = useState<Service | null>(null)
  const [practices, setPractices] = useState<ServicePractice[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modal, setModal] = useState<ModalKey>(null)
  const [period, setPeriod] = useState<PeriodKey>("6M")

  const closeModal = (open: boolean) => {
    if (!open) setModal(null)
  }

  useEffect(() => {
    if (!serviceId) return
    let cancelled = false
    const loadData = async () => {
      try {
        const [serviceData, practicesData] = await Promise.all([
          fetchServiceById(serviceId),
          loadServicePractices(serviceId).catch((error: unknown) => {
            console.error("Errore nel caricamento delle pratiche:", error)
            toast.error("Impossibile caricare le pratiche del servizio")
            return [] as ServicePractice[]
          }),
        ])
        if (cancelled) return
        setService(serviceData)
        // Sicurezza: tengo solo le pratiche di questo servizio, anche se il backend ignora il filtro
        setPractices(
          practicesData.filter((p) => String(p.serviceId ?? p.service?.id) === String(serviceId)),
        )
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [serviceId])

  // ---- Statistiche derivate ----
  const stats = useMemo(() => {
    const active = practices.filter((p) => !isCancelled(p))
    const completed = active.filter(isCompleted)
    const drafts = active.filter(isDraft)
    const inProgress = active.filter((p) => !isCompleted(p) && !isDraft(p))

    const paid: PracticeShare[] = active
      .map((p) => ({ practice: p, amount: paidShareOf(p), orderPaidPct: orderPaidPct(p) }))
      .filter((s) => s.amount > 0.005)
    const pending: PracticeShare[] = active
      .map((p) => ({ practice: p, amount: dueShareOf(p), orderPaidPct: orderPaidPct(p) }))
      .filter((s) => s.amount > 0.005)

    const totalPaid = sum(paid.map((s) => s.amount))
    const totalPending = sum(pending.map((s) => s.amount))
    const totalAgreed = sum(active.map((p) => num(p.amount)))
    const completionRate = active.length ? Math.round((completed.length / active.length) * 100) : 0
    const avgValue = active.length ? totalAgreed / active.length : 0

    const ctPractices = active.filter((p) => p.ctPractice)
    const totalIncentives = sum(ctPractices.map((p) => num(p.ctPractice?.incentiveAmount)))

    return {
      active,
      drafts,
      inProgress,
      completed,
      paid,
      pending,
      totalPaid,
      totalPending,
      totalAgreed,
      completionRate,
      avgValue,
      totalWorks: active.length,
      ctCount: ctPractices.length,
      totalIncentives,
    }
  }, [practices])

  // ---- Andamento nel periodo selezionato (per data di creazione della pratica) ----
  const trend = useMemo(() => {
    const config = PERIODS.find((p) => p.key === period) ?? PERIODS[1]
    const from = periodStart(config.months)
    const inPeriod = practices.filter(
      (p) => !isCancelled(p) && p.createdAt && new Date(p.createdAt).getTime() >= from.getTime(),
    )

    const completed = inPeriod.filter(isCompleted)
    const toComplete = inPeriod.filter((p) => !isCompleted(p))

    // Pagamenti: pratiche con importo, "pagata" se la quota residua è nulla
    const billable = inPeriod.filter((p) => num(p.amount) > 0)
    const paid = billable.filter((p) => dueShareOf(p) <= 0.005)
    const unpaid = billable.filter((p) => dueShareOf(p) > 0.005)
    const collected = sum(billable.map((p) => paidShareOf(p)))
    const outstanding = sum(billable.map((p) => dueShareOf(p)))

    // Pratiche per mese, dal mese di inizio periodo fino a oggi
    const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()
    const byMonth = new Map<number, { completed: number; toComplete: number }>()
    inPeriod.forEach((p) => {
      const k = monthKey(new Date(p.createdAt))
      const m = byMonth.get(k) ?? { completed: 0, toComplete: 0 }
      if (isCompleted(p)) m.completed += 1
      else m.toComplete += 1
      byMonth.set(k, m)
    })
    const lastKey = Math.max(monthKey(new Date()), ...byMonth.keys())
    const monthly: MonthBucket[] = []
    for (let k = monthKey(from); k <= lastKey; k++) {
      const m = byMonth.get(k) ?? { completed: 0, toComplete: 0 }
      monthly.push({
        key: k,
        date: new Date(Math.floor(k / 12), k % 12, 1).toISOString(),
        ...m,
        total: m.completed + m.toComplete,
      })
    }

    return {
      label: config.description,
      from: from.toISOString(),
      monthly,
      total: inPeriod.length,
      completed,
      toComplete,
      completionPct: inPeriod.length ? Math.round((completed.length / inPeriod.length) * 100) : 0,
      paid,
      unpaid,
      collected,
      outstanding,
      collectedPct:
        collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 0,
    }
  }, [practices, period])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: await deleteService(serviceId)
      router.push("/services")
    } catch (error) {
      console.error("Errore nell'eliminazione:", error)
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (!service || notFound) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-red-600">{t("clientDetail.notFound")}</p>
          <Button onClick={() => router.back()}>{t("common.back")}</Button>
        </div>
      </div>
    )
  }

  const accent = service.color || undefined
  const paidPct =
    stats.totalPaid + stats.totalPending > 0
      ? (stats.totalPaid / (stats.totalPaid + stats.totalPending)) * 100
      : 0

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
                  <BreadcrumbLink href="/services">Servizi</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{service.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          {/* Barra azioni */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              ← {t("common.back")}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setModal("info")}>
                <Info className="h-4 w-4" /> Informazioni servizio
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Altre azioni">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                    <Pencil className="h-4 w-4" /> Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="gap-2 text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Intestazione */}
          <div
            className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    service.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {service.isActive ? "Attivo" : "Non attivo"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {service.code} · {service.category}
              </p>
              {service.description && (
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
              )}
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Prezzo di listino</p>
              <p className="text-2xl font-semibold">{formatEuro(num(service.price))}</p>
            </div>
          </div>

          {/* Andamento nel periodo */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Andamento</h2>
                <p className="text-xs text-muted-foreground">
                  Pratiche create dal {formatDate(trend.from)} · {trend.total} nel periodo
                </p>
              </div>
              <div role="group" aria-label="Periodo" className="inline-flex rounded-lg border p-0.5">
                {PERIODS.map((p) => (
                  <Button
                    key={p.key}
                    type="button"
                    size="sm"
                    variant={period === p.key ? "default" : "ghost"}
                    aria-pressed={period === p.key}
                    onClick={() => setPeriod(p.key)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TrendCard
                title="Completamento"
                description="Pratiche completate e da completare"
                chart={
                  <RadialSummaryChart
                    config={completionConfig}
                    values={{ completed: trend.completed.length, toComplete: trend.toComplete.length }}
                    keys={["completed", "toComplete"]}
                    centerValue={`${trend.completionPct}%`}
                    centerLabel="completate"
                  />
                }
                summary={
                  trend.total
                    ? `${trend.completed.length} su ${trend.total} pratiche completate (${trend.label}).`
                    : "Nessuna pratica nel periodo selezionato."
                }
                rows={[
                  {
                    label: "Completate",
                    dot: "bg-emerald-500",
                    value: String(trend.completed.length),
                    onClick: () => setModal("chartCompleted"),
                  },
                  {
                    label: "Da completare",
                    dot: "bg-amber-400",
                    value: String(trend.toComplete.length),
                    hint: trend.toComplete.length ? "bozze incluse" : undefined,
                    onClick: () => setModal("chartToComplete"),
                  },
                ]}
              />

              <TrendCard
                title="Pagamenti"
                description="Importi incassati e insoluti"
                chart={
                  <RadialSummaryChart
                    config={paymentConfig}
                    values={{ collected: trend.collected, outstanding: trend.outstanding }}
                    keys={["collected", "outstanding"]}
                    centerValue={`${trend.collectedPct}%`}
                    centerLabel="incassato"
                    formatValue={formatEuro}
                  />
                }
                summary={
                  trend.collected + trend.outstanding > 0
                    ? `Incassati ${formatEuro(trend.collected)} su ${formatEuro(trend.collected + trend.outstanding)}; insoluti ${formatEuro(trend.outstanding)}.`
                    : "Nessun importo nel periodo selezionato."
                }
                rows={[
                  {
                    label: "Pagate",
                    dot: "bg-emerald-500",
                    value: String(trend.paid.length),
                    hint: "saldate",
                    onClick: () => setModal("chartPaid"),
                  },
                  {
                    label: "Insolute",
                    dot: "bg-rose-400",
                    value: String(trend.unpaid.length),
                    hint: trend.unpaid.length ? `residuo ${formatEuro(trend.outstanding)}` : undefined,
                    onClick: () => setModal("chartUnpaid"),
                  },
                ]}
              />
            </div>

            <MonthlyBars data={trend.monthly} periodLabel={trend.label} />
          </section>

          {/* KPI pratiche */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Pratiche</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Hourglass}
                label="Pratiche in corso"
                value={stats.inProgress.length}
                onClick={() => setModal("inProgress")}
              />
              <StatCard
                icon={CheckCircle2}
                label="Pratiche concluse"
                value={stats.completed.length}
                onClick={() => setModal("completed")}
              />
              <StatCard
                icon={FolderOpen}
                label="Pratiche totali"
                value={stats.totalWorks}
                hint={`${stats.drafts.length} in bozza · valore medio ${formatEuro(stats.avgValue)}`}
                onClick={() => setModal("all")}
              />
              <StatCard
                icon={TrendingUp}
                label="Tasso di completamento"
                value={`${stats.completionRate}%`}
              />
            </div>
          </section>

          {/* KPI pagamenti */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Pagamenti</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Wallet}
                label="Incassato"
                value={formatEuro(stats.totalPaid)}
                hint={`${stats.paid.length} pratiche con incassi`}
                onClick={() => setModal("paid")}
              />
              <StatCard
                icon={Clock}
                label="Da incassare"
                value={formatEuro(stats.totalPending)}
                hint={`${stats.pending.length} pratiche con residuo`}
                onClick={() => setModal("pending")}
              />
              <StatCard
                icon={TrendingUp}
                label="Valore pratiche"
                value={formatEuro(stats.totalAgreed)}
                hint="Somma degli importi delle pratiche"
              />
              <StatCard
                icon={Landmark}
                label="Incentivi Conto Termico"
                value={formatEuro(stats.totalIncentives)}
                hint={`${stats.ctCount} pratiche CT`}
              />
            </div>

            {/* Barra incassato / da incassare */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stato degli incassi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${100 - paidPct}%`, opacity: stats.totalPending ? 1 : 0 }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Incassato {formatEuro(stats.totalPaid)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Da incassare {formatEuro(stats.totalPending)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  I pagamenti sono registrati sull&apos;ordine: qui sono ripartiti sulle pratiche in proporzione al loro
                  importo.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Modale: informazioni servizio */}
        <Dialog open={modal === "info"} onOpenChange={closeModal}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{service.name}</DialogTitle>
              <DialogDescription>Informazioni del servizio.</DialogDescription>
            </DialogHeader>
            <dl className="divide-y">
              <InfoRow label="Codice">{service.code}</InfoRow>
              <InfoRow label="Categoria">{service.category}</InfoRow>
              <InfoRow label="Prezzo">{formatEuro(num(service.price))}</InfoRow>
              <InfoRow label="Stato">{service.isActive ? "Attivo" : "Non attivo"}</InfoRow>
              <InfoRow label="Descrizione">{service.description}</InfoRow>
              <InfoRow label="Note">{service.notes}</InfoRow>
              <InfoRow label="Tag">
                {service.tags?.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {service.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}55` }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </span>
                ) : null}
              </InfoRow>
              <InfoRow label="Link">
                {service.url ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {service.url} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </InfoRow>
              <InfoRow label="Creato il">{formatDate(service.createdAt)}</InfoRow>
              <InfoRow label="Aggiornato il">{formatDate(service.updatedAt)}</InfoRow>
            </dl>
            <DialogFooter>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setModal(null)
                  setEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" /> Modifica
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale: tutte le pratiche */}
        <ListModal
          open={modal === "all"}
          onOpenChange={closeModal}
          title="Tutte le pratiche"
          description={`${stats.totalWorks} pratiche (${stats.drafts.length} in bozza, escluse le annullate).`}
          empty="Nessuna pratica per questo servizio."
          isEmpty={stats.active.length === 0}
        >
          {stats.active.map((p) => (
            <PracticeRow key={p.id} practice={p} />
          ))}
        </ListModal>

        {/* Modale: pratiche in corso */}
        <ListModal
          open={modal === "inProgress"}
          onOpenChange={closeModal}
          title="Pratiche in corso"
          description="Pratiche avviate e non ancora concluse (le bozze sono escluse)."
          empty="Nessuna pratica in corso."
          isEmpty={stats.inProgress.length === 0}
        >
          {stats.inProgress.map((p) => (
            <PracticeRow key={p.id} practice={p} />
          ))}
        </ListModal>

        {/* Modale: pratiche concluse */}
        <ListModal
          open={modal === "completed"}
          onOpenChange={closeModal}
          title="Pratiche concluse"
          description="Pratiche di questo servizio completate."
          empty="Nessuna pratica conclusa."
          isEmpty={stats.completed.length === 0}
        >
          {stats.completed.map((p) => (
            <PracticeRow key={p.id} practice={p} />
          ))}
        </ListModal>

        {/* Modale: incassato */}
        <ListModal
          open={modal === "paid"}
          onOpenChange={closeModal}
          title="Incassato"
          description={`Totale: ${formatEuro(stats.totalPaid)}`}
          empty="Nessun importo incassato."
          isEmpty={stats.paid.length === 0}
        >
          {stats.paid.map((s) => (
            <ShareRow key={s.practice.id} share={s} tone="text-emerald-600" />
          ))}
        </ListModal>

        {/* Modale: da incassare */}
        <ListModal
          open={modal === "pending"}
          onOpenChange={closeModal}
          title="Da incassare"
          description={`Residuo: ${formatEuro(stats.totalPending)}`}
          empty="Nessun importo da incassare."
          isEmpty={stats.pending.length === 0}
        >
          {stats.pending.map((s) => (
            <ShareRow key={s.practice.id} share={s} tone="text-amber-600" />
          ))}
        </ListModal>

        {/* Modali dei grafici: pratiche del periodo selezionato */}
        <ListModal
          open={modal === "chartCompleted"}
          onOpenChange={closeModal}
          title="Pratiche completate"
          description={`${trend.completed.length} pratiche · ${trend.label}`}
          empty="Nessuna pratica completata nel periodo."
          isEmpty={trend.completed.length === 0}
        >
          {trend.completed.map((p) => (
            <PracticeRow key={p.id} practice={p} />
          ))}
        </ListModal>

        <ListModal
          open={modal === "chartToComplete"}
          onOpenChange={closeModal}
          title="Pratiche da completare"
          description={`${trend.toComplete.length} pratiche · ${trend.label}`}
          empty="Nessuna pratica da completare nel periodo."
          isEmpty={trend.toComplete.length === 0}
        >
          {trend.toComplete.map((p) => (
            <PracticeRow key={p.id} practice={p} />
          ))}
        </ListModal>

        <ListModal
          open={modal === "chartPaid"}
          onOpenChange={closeModal}
          title="Pratiche pagate"
          description={`${trend.paid.length} pratiche saldate · ${trend.label}`}
          empty="Nessuna pratica pagata nel periodo."
          isEmpty={trend.paid.length === 0}
        >
          {trend.paid.map((p) => (
            <ShareRow
              key={p.id}
              share={{ practice: p, amount: paidShareOf(p), orderPaidPct: orderPaidPct(p) }}
              tone="text-emerald-600"
            />
          ))}
        </ListModal>

        <ListModal
          open={modal === "chartUnpaid"}
          onOpenChange={closeModal}
          title="Pratiche insolute"
          description={`${trend.unpaid.length} pratiche con residuo (${formatEuro(trend.outstanding)}) · ${trend.label}`}
          empty="Nessuna pratica insoluta nel periodo."
          isEmpty={trend.unpaid.length === 0}
        >
          {trend.unpaid.map((p) => (
            <ShareRow
              key={p.id}
              share={{ practice: p, amount: dueShareOf(p), orderPaidPct: orderPaidPct(p) }}
              tone="text-rose-600"
            />
          ))}
        </ListModal>

        {/* Modale: conferma eliminazione */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminare il servizio?</DialogTitle>
              <DialogDescription>
                Stai per eliminare «{service.name}». L&apos;operazione non può essere annullata.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                Annulla
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale di modifica */}
        <ServiceModal isOpen={editOpen} setIsOpen={setEditOpen} service={service} setService={setService} />
      </SidebarInset>
    </SidebarProvider>
  )
}
