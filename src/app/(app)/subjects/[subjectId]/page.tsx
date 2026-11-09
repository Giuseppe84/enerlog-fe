"use client";
import { useState, useEffect, useMemo, type ReactNode } from "react"
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
  Building,
  FolderOpen,
  FileText,
  IdCard,
  Banknote,
  MapPin,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import type { SubjectInput } from "@/types/subject"
import type { Property, CadastralData } from "@/types/property"
import type { Practice } from "@/types/practice"
import { fetchSubjectById } from "@/api/subjects"
import { fetchPropertiesBySubject } from "@/api/properties"
// TODO: adatta al nome reale della chiamata (come nella pagina del servizio)
import { fetchPractices } from "@/api/practices"
import SubjectDetailsCard from "./SubjectDetails"
import { SubjectModal } from "@/components/forms/SubjectFormModal"
import { PropertiesModal } from "@/components/modals/PropertiesModal"

// ---------------------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------------------

// La risposta dell'API ha gli id annidati solo in parte: li leggo anche dai campi piatti
type SubjectPractice = Practice & {
  propertyId?: string | null
  orderId?: string | null
  subjectId?: string | null
}

interface SubjectDocument {
  id?: string
  name?: string | null
  fileName?: string | null
  type?: string | null
  category?: string | null
  size?: number | null
  url?: string | null
  createdAt?: string | null
}

type ModalKey = "details" | null

// ---------------------------------------------------------------------------
// Caricamento dati
// ---------------------------------------------------------------------------

// TODO: collega l'API dei documenti (es. fetchDocumentsBySubject(subjectId)) e restituisci SubjectDocument[]
async function loadDocuments(_subjectId: string): Promise<SubjectDocument[]> {
  return []
}

/** Estrae elementi e numero di pagine da { data: [...], meta: { pages } } (anche dentro una risposta axios). */
const extractPage = (res: any): { items: SubjectPractice[]; pages: number } => {
  const body = Array.isArray(res?.data?.data) ? res.data : res
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
  const pages = Number(body?.meta?.pages ?? 1) || 1
  return { items, pages }
}

const PAGE_LIMIT = 100
const MAX_PAGES = 50

async function loadSubjectPractices(subjectId: string): Promise<SubjectPractice[]> {
  const request = (page: number) =>
    fetchPractices({ query: "", subjectId, page, limit: PAGE_LIMIT }).then(extractPage)

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

const money = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const eur = (v: unknown) => money.format(num(v))

const fmtDate = (v?: string | null) => {
  if (!v) return "—"
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const fmtSize = (bytes?: number | null) => {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const cadastralLabel = (c: CadastralData) =>
  [
    c.sheet && `Fg. ${c.sheet}`,
    c.parcel && `Part. ${c.parcel}`,
    c.subaltern && `Sub. ${c.subaltern}`,
    c.category && `Cat. ${c.category}`,
  ]
    .filter(Boolean)
    .join(" ")

const propertyCadastral = (p: Property) =>
  (p.cadastralData ?? []).map(cadastralLabel).filter(Boolean).join(" · ")

const propertyTitle = (p?: Property | null) =>
  [p?.address, p?.city].filter(Boolean).join(", ") || p?.name || "Immobile senza indirizzo"

const PRACTICE_TYPE: Record<string, string> = {
  GENERIC: "Generica",
  CONTO_TERMICO: "Conto Termico",
  APE: "APE",
  FV_CONNESSIONE: "FV connessione",
  ENEA: "ENEA",
  L10: "L10",
  PG_EL: "Progetto elettrico",
  PG_CL: "Progetto climatizzazione",
  PT_MET: "Pratica metano",
}

// Stati delle pratiche: etichetta, stile del badge e colore nella barra
const STATUS_META: Record<string, { label: string; badge: string; bar: string }> = {
  DRAFT: {
    label: "Bozza",
    badge: "border-transparent bg-muted text-muted-foreground",
    bar: "bg-slate-400",
  },
  PENDING: {
    label: "In attesa",
    badge: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    bar: "bg-amber-400",
  },
  IN_PROGRESS: {
    label: "In lavorazione",
    badge: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    bar: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completata",
    badge: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    bar: "bg-green-500",
  },
  CANCELLED: {
    label: "Annullata",
    badge: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    bar: "bg-red-400",
  },
}
const STATUS_ORDER = ["DRAFT", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
const UNKNOWN_META = { label: "", badge: "border-transparent bg-muted text-muted-foreground", bar: "bg-slate-300" }

const statusKey = (p: Practice) => String(p.status ?? "UNKNOWN").toUpperCase()
const statusMeta = (key: string) => {
  const m = STATUS_META[key]
  return m ?? { ...UNKNOWN_META, label: key === "UNKNOWN" ? "Non definito" : key }
}
const statusRank = (key: string) => {
  const i = STATUS_ORDER.indexOf(key)
  return i === -1 ? STATUS_ORDER.length : i
}

// ---------------------------------------------------------------------------
// Componenti di supporto
// ---------------------------------------------------------------------------

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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
}

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const { subjectId } = useParams<{ subjectId: string }>()

  const [subject, setSubject] = useState<SubjectInput | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [practices, setPractices] = useState<SubjectPractice[]>([])
  const [documents, setDocuments] = useState<SubjectDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modal, setModal] = useState<ModalKey>(null)
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false)

  const closeModal = (open: boolean) => {
    if (!open) setModal(null)
  }

  useEffect(() => {
    if (!subjectId) return
    let cancelled = false
    setLoading(true)

    const loadData = async () => {
      try {
        // Il soggetto è indispensabile; il resto non deve bloccare la pagina
        const [subjectData, propertiesData, practicesData, documentsData] = await Promise.all([
          fetchSubjectById(subjectId),
          fetchPropertiesBySubject(subjectId).catch((error: unknown) => {
            console.error("Errore nel caricamento degli immobili:", error)
            toast.error("Impossibile caricare gli immobili")
            return [] as Property[]
          }),
          loadSubjectPractices(subjectId).catch((error: unknown) => {
            console.error("Errore nel caricamento delle pratiche:", error)
            toast.error("Impossibile caricare le pratiche")
            return [] as SubjectPractice[]
          }),
          loadDocuments(subjectId).catch((error: unknown) => {
            console.error("Errore nel caricamento dei documenti:", error)
            toast.error("Impossibile caricare i documenti")
            return [] as SubjectDocument[]
          }),
        ])
        if (cancelled) return
        setSubject(subjectData)
        setProperties((propertiesData as any)?.data ?? propertiesData ?? [])
        // Sicurezza: tengo solo le pratiche di questo soggetto, anche se il backend ignora il filtro
        setPractices(
          practicesData.filter((p) => String(p.subjectId ?? p.subject?.id) === String(subjectId)),
        )
        setDocuments(documentsData)
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
  }, [subjectId])

  // ---- Dati derivati ----
  const byStatus = useMemo(() => {
    const map = new Map<string, SubjectPractice[]>()
    practices.forEach((p) => {
      const key = statusKey(p)
      map.set(key, [...(map.get(key) ?? []), p])
    })
    return [...map.entries()]
      .sort(([a], [b]) => statusRank(a) - statusRank(b))
      .map(([key, items]) => ({ key, items, meta: statusMeta(key) }))
  }, [practices])

  const visiblePractices = useMemo(
    () => (statusFilter === "ALL" ? practices : practices.filter((p) => statusKey(p) === statusFilter)),
    [practices, statusFilter],
  )

  const totalValue = useMemo(
    () => practices.filter((p) => statusKey(p) !== "CANCELLED").reduce((s, p) => s + num(p.amount), 0),
    [practices],
  )

  // Pratiche per immobile
  const practicesByProperty = useMemo(() => {
    const map = new Map<string, number>()
    practices.forEach((p) => {
      const id = p.propertyId ?? p.property?.id
      if (id) map.set(String(id), (map.get(String(id)) ?? 0) + 1)
    })
    return map
  }, [practices])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: await deleteSubject(subjectId)
      router.push("/subjects")
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

  if (!subject || notFound) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-red-600">{t("clientDetail.notFound")}</p>
          <Button onClick={() => router.back()}>{t("common.back")}</Button>
        </div>
      </div>
    )
  }

  const sx = subject as any
  const displayName = subject.companyName
    ? subject.companyName
    : `${subject.firstName || ""} ${subject.lastName || ""}`.trim()
  const typeLabel = sx.type === "LEGAL" ? "Persona giuridica" : sx.type === "PHYSICAL" ? "Persona fisica" : null
  const address = [sx.address, sx.city, sx.province].filter(Boolean).join(", ")
  const contact = [subject.firstName, subject.lastName].filter(Boolean).join(" ")

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
                  <BreadcrumbLink href="/subjects">Soggetti</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
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
              <Button variant="outline" className="gap-2" onClick={() => setModal("details")}>
                <IdCard className="h-4 w-4" /> Scheda anagrafica
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
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
              {typeLabel && <Badge variant="secondary">{typeLabel}</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[subject.taxCode && `CF ${subject.taxCode}`, subject.vatNumber && `P.IVA ${subject.vatNumber}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {/* Indicatori */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Building} label="Immobili" value={properties.length} />
            <Kpi
              icon={FolderOpen}
              label="Pratiche"
              value={practices.length}
              hint={byStatus.length ? `${byStatus.length} stati diversi` : undefined}
            />
            <Kpi icon={Banknote} label="Valore pratiche" value={eur(totalValue)} hint="Annullate escluse" />
            <Kpi icon={FileText} label="Documenti" value={documents.length} />
          </div>

          {/* Anagrafica + pratiche per stato */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IdCard className="h-4 w-4" /> Anagrafica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  {typeLabel && <InfoRow label="Tipo">{typeLabel}</InfoRow>}
                  {subject.companyName && contact && <InfoRow label="Referente">{contact}</InfoRow>}
                  {subject.taxCode && <InfoRow label="Codice fiscale">{subject.taxCode}</InfoRow>}
                  {subject.vatNumber && <InfoRow label="P.IVA">{subject.vatNumber}</InfoRow>}
                  {sx.email && <InfoRow label="Email">{sx.email}</InfoRow>}
                  {sx.pec && <InfoRow label="PEC">{sx.pec}</InfoRow>}
                  {sx.phone && <InfoRow label="Telefono">{sx.phone}</InfoRow>}
                  {address && <InfoRow label="Indirizzo">{address}</InfoRow>}
                  {sx.createdAt && <InfoRow label="Creato il">{fmtDate(sx.createdAt)}</InfoRow>}
                </dl>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setModal("details")}>
                  Apri scheda completa
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Pratiche per stato</CardTitle>
                <CardDescription>Clicca uno stato per filtrare l&apos;elenco qui sotto.</CardDescription>
              </CardHeader>
              <CardContent>
                {practices.length === 0 ? (
                  <Empty>Nessuna pratica associata a questo soggetto.</Empty>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label="Distribuzione delle pratiche per stato"
                    >
                      {byStatus.map(({ key, items, meta }) => (
                        <div
                          key={key}
                          className={meta.bar}
                          style={{ width: `${(items.length / practices.length) * 100}%` }}
                          title={`${meta.label}: ${items.length}`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        aria-pressed={statusFilter === "ALL"}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          statusFilter === "ALL"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        Tutte · {practices.length}
                      </button>
                      {byStatus.map(({ key, items, meta }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
                          aria-pressed={statusFilter === key}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                            statusFilter === key
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${meta.bar}`} />
                          {meta.label} · {items.length}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Elenco pratiche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-4 w-4" /> Pratiche associate
                <Badge variant="secondary">{visiblePractices.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visiblePractices.length === 0 ? (
                <Empty>Nessuna pratica da mostrare.</Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pratica</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Immobile</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Creata il</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePractices.map((p) => {
                      const meta = statusMeta(statusKey(p))
                      const orderId = p.orderId ?? p.order?.id
                      return (
                        <TableRow
                          key={p.id}
                          className={orderId ? "cursor-pointer" : undefined}
                          onClick={orderId ? () => router.push(`/orders/${orderId}`) : undefined}
                        >
                          <TableCell>
                            <div className="font-medium">{p.name || "Pratica"}</div>
                            {p.description && p.description !== p.name && (
                              <div className="text-xs text-muted-foreground">{p.description}</div>
                            )}
                          </TableCell>
                          <TableCell>{PRACTICE_TYPE[p.type] ?? p.type ?? "—"}</TableCell>
                          <TableCell>{p.property ? propertyTitle(p.property) : "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={meta.badge}>
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{fmtDate(p.createdAt)}</TableCell>
                          <TableCell className="text-right">{eur(p.amount)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Immobili */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4" /> Immobili associati
                <Badge variant="secondary">{properties.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setPropertiesModalOpen(true)}>
                Gestisci immobili
              </Button>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <Empty>Nessun immobile associato a questo soggetto.</Empty>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {properties.map((p) => {
                    const cadastral = propertyCadastral(p)
                    const count = p.id ? practicesByProperty.get(String(p.id)) ?? 0 : 0
                    return (
                      <div key={p.id ?? propertyTitle(p)} className="rounded-xl border p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{propertyTitle(p)}</p>
                            {p.province && <p className="text-xs text-muted-foreground">{p.province}</p>}
                            {cadastral && <p className="mt-1 text-xs text-muted-foreground">{cadastral}</p>}
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {count} {count === 1 ? "pratica" : "pratiche"}
                          </Badge>
                        </div>
                        {(p.propertyType || p.buildingType || p.sup) && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {[p.propertyType, p.buildingType, p.sup ? `${p.sup} m²` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documenti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Documenti
                <Badge variant="secondary">{documents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <Empty>Nessun documento caricato per questo soggetto.</Empty>
              ) : (
                <ul className="divide-y">
                  {documents.map((d, i) => (
                    <li key={d.id ?? i} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.name || d.fileName || "Documento senza nome"}</p>
                          <p className="text-xs text-muted-foreground">
                            {[d.category ?? d.type, fmtDate(d.createdAt), fmtSize(d.size)]
                              .filter((x) => x && x !== "—")
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                      {d.url && (
                        <Button variant="ghost" size="icon" asChild aria-label="Apri documento">
                          <a href={d.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modale: scheda anagrafica completa */}
        <Dialog open={modal === "details"} onOpenChange={closeModal}>
          <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Scheda anagrafica</DialogTitle>
              <DialogDescription>Informazioni anagrafiche del soggetto.</DialogDescription>
            </DialogHeader>
            <SubjectDetailsCard subject={subject as any} setSubject={setSubject} />
          </DialogContent>
        </Dialog>

        {/* Modale: gestione immobili */}
        <PropertiesModal
          open={propertiesModalOpen}
          onOpenChange={setPropertiesModalOpen}
          properties={properties}
        />

        {/* Modale: conferma eliminazione */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminare il soggetto?</DialogTitle>
              <DialogDescription>
                Stai per eliminare «{displayName}». L&apos;operazione non può essere annullata.
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
        <SubjectModal isOpen={editOpen} setIsOpen={setEditOpen} subject={subject} setSubject={setSubject} />
      </SidebarInset>
    </SidebarProvider>
  )
}
