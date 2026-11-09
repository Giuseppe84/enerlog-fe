"use client"

import { useMemo, type ReactNode } from "react"
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  Receipt,
  TriangleAlert,
  User,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order } from "@/types/order"

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

type Row = Record<string, any>
type Tone = "green" | "amber" | "red" | "blue" | "gray"

const TONES: Record<Tone, string> = {
  green: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  amber: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  red: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  blue: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  gray: "border-transparent bg-muted text-muted-foreground",
}

const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const money = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const eur = (v: unknown) => money.format(num(v))

const fmtDate = (v?: string | null) => {
  if (!v) return "—"
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const personName = (x?: Row | null) =>
  x?.companyName || [x?.lastName, x?.firstName].filter(Boolean).join(" ") || "—"

const ORDER_STATUS: Record<Order["status"], { label: string; tone: Tone }> = {
  DRAFT: { label: "Bozza", tone: "gray" },
  PENDING: { label: "In attesa", tone: "amber" },
  IN_PROGRESS: { label: "In lavorazione", tone: "blue" },
  COMPLETED: { label: "Completato", tone: "green" },
  CANCELLED: { label: "Annullato", tone: "red" },
}

const PRACTICE_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Bozza", tone: "gray" },
  PENDING: { label: "In attesa", tone: "amber" },
  IN_PROGRESS: { label: "In lavorazione", tone: "blue" },
  COMPLETED: { label: "Completata", tone: "green" },
  DONE: { label: "Completata", tone: "green" },
  CLOSED: { label: "Chiusa", tone: "green" },
  CANCELLED: { label: "Annullata", tone: "red" },
}

const PRACTICE_TYPE: Record<string, string> = {
  GENERIC: "Generica",
  CONTO_TERMICO: "Conto Termico",
  APE: "APE",
  FV_CONNESSIONE: "FV connessione",
  ENEA: "ENEA",
  L10: "L10",
  PG_EL: "PG_EL",
  PG_CL: "PG_CL",
  PT_MET: "PT_MET",
}

const DONE_STATUSES = ["COMPLETED", "DONE", "CLOSED"]
const isDone = (p: Row) => DONE_STATUSES.includes(String(p.status ?? "").toUpperCase())
const isCancelled = (p: Row) => String(p.status ?? "").toUpperCase() === "CANCELLED"
const isOverdue = (p: Row) =>
  !!p.endDate && !isDone(p) && !isCancelled(p) && new Date(p.endDate).getTime() < Date.now()

// ---------------------------------------------------------------------------
// Componenti di supporto
// ---------------------------------------------------------------------------

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <Badge variant="outline" className={TONES[tone]}>
      {label}
    </Badge>
  )
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={`h-full rounded-full transition-all ${v >= 100 ? "bg-green-600" : "bg-primary"}`}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold leading-tight">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{children}</dd>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

interface OrderDetailProps {
  order: Order
  /** Azioni da mostrare in alto a destra (es. menu Modifica / Elimina). */
  actions?: ReactNode
}

export function OrderDetail({ order, actions }: OrderDetailProps) {
  const o = order as Order & Row

  // Tutte le pratiche dell'ordine, con il gruppo di provenienza
  const practices = useMemo<Row[]>(
    () => [
      ...(o.practices ?? []).map((p: Row) => ({ ...p, __group: "Pratica" })),
      ...(o.ctPractices ?? []).map((p: Row) => ({ ...p, __group: "Conto Termico" })),
      ...(o.fvPractices ?? []).map((p: Row) => ({ ...p, __group: "Fotovoltaico" })),
    ],
    [o.practices, o.ctPractices, o.fvPractices],
  )

  const payments: Row[] = o.payments ?? []
  const invoices: Row[] = o.invoices ?? []
  const quote: Row | null = o.quote ?? o.quotes?.[0] ?? null

  // Avanzamento pratiche (le annullate non contano)
  const active = practices.filter((p) => !isCancelled(p))
  const doneCount = active.filter(isDone).length
  const practicesPct = active.length ? (doneCount / active.length) * 100 : 0
  const overdueCount = active.filter(isOverdue).length

  // Pagamenti
  const total = num(o.totalAmount)
  const paid = num(o.paidAmount)
  const remaining = Math.max(total - paid, 0)
  const paidPct = total > 0 ? (paid / total) * 100 : 0
  const payment: { label: string; tone: Tone } =
    paid <= 0
      ? { label: "Non pagato", tone: "red" }
      : total > 0 && paid >= total
        ? { label: "Pagato", tone: "green" }
        : { label: "Pagato parzialmente", tone: "amber" }

  // Fatturazione
  const invoicedTotal = invoices.reduce((s, i) => s + num(i.totalAmount ?? i.amount ?? i.total), 0)
  const invoicedPct = total > 0 ? (invoicedTotal / total) * 100 : 0

  // Date delle pratiche
  const starts = active.map((p) => p.startDate).filter(Boolean).map((d: string) => new Date(d).getTime())
  const ends = active.map((p) => p.endDate).filter(Boolean).map((d: string) => new Date(d).getTime())
  const firstStart = starts.length ? new Date(Math.min(...starts)).toISOString() : null
  const lastEnd = ends.length ? new Date(Math.max(...ends)).toISOString() : null

  const status = ORDER_STATUS[o.status] ?? { label: o.status, tone: "gray" as Tone }
  const client = o.client as Row | undefined

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Ordine {o.code}</h1>
            <StatusBadge {...status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {client ? `${personName(client)} · ` : ""}creato il {fmtDate(o.createdAt)}
          </p>
        </div>
        {actions}
      </div>

      {/* Indicatori */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Banknote} label="Totale ordine" value={eur(total)} hint={`${paidPct.toFixed(0)}% incassato`} />
        <Kpi icon={CheckCircle2} label="Incassato" value={eur(paid)} hint={<StatusBadge {...payment} />} />
        <Kpi
          icon={Receipt}
          label="Residuo da incassare"
          value={eur(remaining)}
          hint={remaining === 0 && total > 0 ? "Saldato" : undefined}
        />
        <Kpi
          icon={ClipboardList}
          label="Pratiche completate"
          value={`${doneCount} / ${active.length}`}
          hint={
            overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-red-600">
                <TriangleAlert className="h-3 w-3" /> {overdueCount} in ritardo
              </span>
            ) : undefined
          }
        />
      </div>

      {/* Avanzamento + cliente e date */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Avanzamento</CardTitle>
            <CardDescription>Stato di completamento, incasso e fatturazione dell&apos;ordine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Pratiche</span>
                <span className="text-muted-foreground">
                  {doneCount} di {active.length} · {practicesPct.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={practicesPct} label="Avanzamento pratiche" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Pagamenti</span>
                <span className="text-muted-foreground">
                  {eur(paid)} di {eur(total)} · {paidPct.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={paidPct} label="Avanzamento pagamenti" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fatturazione</span>
                <span className="text-muted-foreground">
                  {eur(invoicedTotal)} di {eur(total)} · {invoicedPct.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={invoicedPct} label="Avanzamento fatturazione" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Cliente e date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <InfoRow label="Cliente">{personName(client)}</InfoRow>
              {client?.email && <InfoRow label="Email">{client.email}</InfoRow>}
              {client?.phone && <InfoRow label="Telefono">{client.phone}</InfoRow>}
              <Separator />
              <InfoRow label="Creato il">{fmtDate(o.createdAt)}</InfoRow>
              <InfoRow label="Aggiornato il">{fmtDate(o.updatedAt)}</InfoRow>
              <InfoRow label="Prima pratica dal">{fmtDate(firstStart)}</InfoRow>
              <InfoRow label="Ultima scadenza">{fmtDate(lastEnd)}</InfoRow>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Pratiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" /> Pratiche associate
            <Badge variant="secondary">{practices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {practices.length === 0 ? (
            <Empty>Nessuna pratica associata a questo ordine.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pratica</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Soggetto / Immobile</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practices.map((p, i) => {
                  const st = PRACTICE_STATUS[String(p.status ?? "").toUpperCase()]
                  const overdue = isOverdue(p)
                  return (
                    <TableRow key={p.id ?? i}>
                      <TableCell>
                        <div className="font-medium">{p.name ?? p.title ?? "Pratica"}</div>
                        {p.code && <div className="text-xs text-muted-foreground">{p.code}</div>}
                      </TableCell>
                      <TableCell>{PRACTICE_TYPE[p.type] ?? p.type ?? p.__group}</TableCell>
                      <TableCell>
                        <div>{p.subject ? personName(p.subject) : "—"}</div>
                        {p.property && (
                          <div className="text-xs text-muted-foreground">
                            {[p.property.address, p.property.city].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {st ? <StatusBadge {...st} /> : <span className="text-muted-foreground">{p.status ?? "—"}</span>}
                      </TableCell>
                      <TableCell className={overdue ? "font-medium text-red-600" : undefined}>
                        {fmtDate(p.endDate)}
                        {overdue && <div className="text-xs">In ritardo</div>}
                      </TableCell>
                      <TableCell className="text-right">{p.amount != null ? eur(p.amount) : "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagamenti, fatture, preventivo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Banknote className="h-4 w-4" /> Pagamenti
            </CardTitle>
            <StatusBadge {...payment} />
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <Empty>Nessun pagamento registrato.</Empty>
            ) : (
              <ul className="divide-y">
                {payments.map((p, i) => (
                  <li key={p.id ?? i} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{eur(p.amount)}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {fmtDate(p.paidAt ?? p.date ?? p.createdAt)}
                        {p.method ? ` · ${p.method}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              Incassato {eur(paid)} su {eur(total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Fatture
            </CardTitle>
            <Badge variant="secondary">{invoices.length}</Badge>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <Empty>Nessuna fattura emessa.</Empty>
            ) : (
              <ul className="divide-y">
                {invoices.map((inv, i) => (
                  <li key={inv.id ?? i} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{inv.number ?? inv.code ?? "Fattura"}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {fmtDate(inv.issuedAt ?? inv.date ?? inv.createdAt)}
                        {inv.status ? ` · ${inv.status}` : ""}
                      </div>
                    </div>
                    <span className="shrink-0 font-medium">{eur(inv.totalAmount ?? inv.amount ?? inv.total)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              Fatturato {eur(invoicedTotal)} su {eur(total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSignature className="h-4 w-4" /> Preventivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!quote ? (
              <Empty>Nessun preventivo collegato a questo ordine.</Empty>
            ) : (
              <dl className="space-y-2">
                <InfoRow label="Numero">{quote.number ?? quote.code ?? "—"}</InfoRow>
                <InfoRow label="Stato">{quote.status ?? "—"}</InfoRow>
                <InfoRow label="Importo">{eur(quote.totalAmount ?? quote.amount ?? quote.total)}</InfoRow>
                <InfoRow label="Data">{fmtDate(quote.issuedAt ?? quote.date ?? quote.createdAt)}</InfoRow>
                {quote.validUntil && <InfoRow label="Valido fino al">{fmtDate(quote.validUntil)}</InfoRow>}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Separator() {
  return <div className="my-1 border-t" />
}
