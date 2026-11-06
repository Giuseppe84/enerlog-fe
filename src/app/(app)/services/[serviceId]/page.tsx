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
  FolderOpen,
  ChevronRight,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import type { Service } from "@/types/service"
import { fetchServiceById } from "@/api/services"
import { ServiceModal } from "@/components/modals/ServiceFormModal"
// TODO: crea questa chiamata (es. GET /services/:id/works?include=payments)
// import { fetchWorksByService } from "@/api/works"

// ---------------------------------------------------------------------------
// Tipi estesi: `Service.works` contiene solo { id }, quindi per la dashboard
// servono le pratiche con stato e pagamenti. Adatta ai tuoi tipi reali.
// ---------------------------------------------------------------------------
type WorkStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
type PaymentStatus = "PAID" | "PENDING"

interface ServicePayment {
  id: string
  amount: number
  date?: string | null
  status: PaymentStatus
  description?: string | null
}

interface ServiceWork {
  id: string
  title?: string | null
  clientName?: string | null
  status: WorkStatus
  amount?: number | null      // importo concordato
  startedAt?: string | null
  completedAt?: string | null
  payments: ServicePayment[]
}

type ModalKey = "info" | "inProgress" | "completed" | "paid" | "pending" | null

// ---------- Utility ----------

const formatEuro = (value: number | null | undefined) =>
  `€ ${Number(value || 0).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("it-IT") : "—"

const sum = (items: { amount: number }[]) =>
  items.reduce((acc, i) => acc + (i.amount || 0), 0)

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

function WorkRow({ work }: { work: ServiceWork }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{work.title || `Pratica ${work.id}`}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {work.clientName ? `${work.clientName} · ` : ""}
          {work.status === "COMPLETED"
            ? `Conclusa il ${formatDate(work.completedAt)}`
            : `Avviata il ${formatDate(work.startedAt)}`}
        </p>
      </div>
      {work.amount != null && <p className="shrink-0 font-semibold">{formatEuro(work.amount)}</p>}
    </div>
  )
}

// ---------- Pagina ----------

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const { serviceId } = useParams<{ serviceId: string }>()

  const [service, setService] = useState<Service | null>(null)
  const [works, setWorks] = useState<ServiceWork[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modal, setModal] = useState<ModalKey>(null)

  const closeModal = (open: boolean) => {
    if (!open) setModal(null)
  }

  useEffect(() => {
    if (!serviceId) return
    let cancelled = false
    const loadData = async () => {
      try {
        const [serviceData /*, worksData */] = await Promise.all([
          fetchServiceById(serviceId),
          // fetchWorksByService(serviceId),
        ])
        if (cancelled) return
        setService(serviceData)
        // setWorks(worksData || [])
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
    const inProgress = works.filter((w) => w.status === "IN_PROGRESS")
    const completed = works.filter((w) => w.status === "COMPLETED")
    const active = works.filter((w) => w.status !== "CANCELLED")

    const allPayments = works.flatMap((w) =>
      w.payments.map((p) => ({ ...p, work: w }))
    )
    const paid = allPayments.filter((p) => p.status === "PAID")
    const pending = allPayments.filter((p) => p.status === "PENDING")

    const totalPaid = sum(paid)
    const totalPending = sum(pending)
    const totalAgreed = active.reduce((acc, w) => acc + (w.amount || 0), 0)
    const completionRate = active.length ? Math.round((completed.length / active.length) * 100) : 0
    const avgValue = active.length ? totalAgreed / active.length : 0

    return {
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
    }
  }, [works])

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
  const paidShare =
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
              <p className="text-2xl font-semibold">{formatEuro(service.price)}</p>
            </div>
          </div>

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
                hint={`Valore medio ${formatEuro(stats.avgValue)}`}
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
                hint={`${stats.paid.length} pagamenti`}
                onClick={() => setModal("paid")}
              />
              <StatCard
                icon={Clock}
                label="Pagamenti in corso"
                value={formatEuro(stats.totalPending)}
                hint={`${stats.pending.length} da incassare`}
                onClick={() => setModal("pending")}
              />
              <StatCard
                icon={TrendingUp}
                label="Valore pratiche"
                value={formatEuro(stats.totalAgreed)}
                hint="Somma degli importi concordati"
              />
              <StatCard
                icon={Wallet}
                label="Da fatturare"
                value={formatEuro(Math.max(stats.totalAgreed - stats.totalPaid - stats.totalPending, 0))}
                hint="Importi non ancora richiesti"
              />
            </div>

            {/* Barra incassato / in corso */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stato degli incassi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-emerald-500" style={{ width: `${paidShare}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${100 - paidShare}%`, opacity: stats.totalPending ? 1 : 0 }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Incassato {formatEuro(stats.totalPaid)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> In corso {formatEuro(stats.totalPending)}
                  </span>
                </div>
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
              <InfoRow label="Prezzo">{formatEuro(service.price)}</InfoRow>
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

        {/* Modale: pratiche in corso */}
        <ListModal
          open={modal === "inProgress"}
          onOpenChange={closeModal}
          title="Pratiche in corso"
          description="Pratiche di questo servizio ancora aperte."
          empty="Nessuna pratica in corso."
          isEmpty={stats.inProgress.length === 0}
        >
          {stats.inProgress.map((w) => (
            <WorkRow key={w.id} work={w} />
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
          {stats.completed.map((w) => (
            <WorkRow key={w.id} work={w} />
          ))}
        </ListModal>

        {/* Modale: pagamenti incassati */}
        <ListModal
          open={modal === "paid"}
          onOpenChange={closeModal}
          title="Pagamenti incassati"
          description={`Totale: ${formatEuro(stats.totalPaid)}`}
          empty="Nessun pagamento incassato."
          isEmpty={stats.paid.length === 0}
        >
          {stats.paid.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{p.description || p.work.title || "Pagamento"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(p.date)}</p>
              </div>
              <p className="font-semibold text-emerald-600">{formatEuro(p.amount)}</p>
            </div>
          ))}
        </ListModal>

        {/* Modale: pagamenti in corso */}
        <ListModal
          open={modal === "pending"}
          onOpenChange={closeModal}
          title="Pagamenti in corso"
          description={`Da incassare: ${formatEuro(stats.totalPending)}`}
          empty="Nessun pagamento in corso."
          isEmpty={stats.pending.length === 0}
        >
          {stats.pending.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{p.description || p.work.title || "Pagamento"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Scadenza {formatDate(p.date)}</p>
              </div>
              <p className="font-semibold text-amber-600">{formatEuro(p.amount)}</p>
            </div>
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
