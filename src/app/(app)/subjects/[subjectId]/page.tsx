"use client";
import { useState, useEffect, type ReactNode } from "react"
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
  Building,
  FolderOpen,
  FileText,
  IdCard,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import type { SubjectInput } from "@/types/subject"
import type { Property } from "@/types/property"
import type { Work } from "@/types/work"
import { fetchSubjectById } from "@/api/subjects"
import { fetchPropertiesBySubject } from "@/api/properties"
// import { fetchWorksBySubject } from "@/api/works"
import SubjectDetailsCard from "./SubjectDetails"
import { SubjectModal } from "@/components/modals/SubjectFormModal"
import { PropertiesModal } from '@/components/modals/PropertiesModal';


type ModalKey = "details" | "properties" | "works" | "documents" | null

// ---------- Componenti di supporto ----------

function DashboardButton({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <span className="flex-1">
        <span className="block text-2xl font-semibold leading-none">{value}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{label}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
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

// ---------- Pagina ----------

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const { subjectId } = useParams<{ subjectId: string }>()

  const [subject, setSubject] = useState<SubjectInput | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modal, setModal] = useState<ModalKey>(null)
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const closeModal = (open: boolean) => {
    if (!open) setModal(null)
  }

  useEffect(() => {
    if (!subjectId) return
    let cancelled = false
    const loadData = async () => {
      try {
        const [subjectData, propertiesData] = await Promise.all([
          fetchSubjectById(subjectId),
          fetchPropertiesBySubject(subjectId),
          // fetchWorksBySubject(subjectId),
        ])
        if (cancelled) return
        setSubject(subjectData)
        setProperties(propertiesData || [])
        // setWorks(worksData || [])
        // setDocuments(documentsData || [])
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

  const displayName = subject.companyName
    ? subject.companyName
    : `${subject.firstName || ""} ${subject.lastName || ""}`.trim()

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

        <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
          {/* Barra azioni */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              ← {t("common.back")}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setModal("details")}>
                <IdCard className="h-4 w-4" /> Dati anagrafici
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
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>

          {/* Dashboard */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DashboardButton
              icon={Building}
              label="Immobili"
              value={properties.length}
              onClick={() => setPropertiesModalOpen(true)}
            />
            <DashboardButton
              icon={FolderOpen}
              label="Pratiche"
              value={works.length}
              onClick={() => setModal("works")}
            />
            <DashboardButton
              icon={FileText}
              label="Documenti"
              value={documents.length}
              onClick={() => setModal("documents")}
            />
          </div>
        </div>

        {/* Modale: dati anagrafici */}
        <Dialog open={modal === "details"} onOpenChange={closeModal}>
          <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dati anagrafici</DialogTitle>
              <DialogDescription>Informazioni anagrafiche del soggetto.</DialogDescription>
            </DialogHeader>
            <SubjectDetailsCard subject={subject as any} setSubject={setSubject} />
          </DialogContent>
        </Dialog>

        {/* Modale: immobili */}
        <PropertiesModal
          open={propertiesModalOpen}
          onOpenChange={setPropertiesModalOpen}
          properties={properties}
        />

        {/* Modale: pratiche */}
        <ListModal
          open={modal === "works"}
          onOpenChange={closeModal}
          title="Pratiche"
          description="Pratiche collegate a questo soggetto."
          empty="Nessuna pratica associata."
          isEmpty={works.length === 0}
        >
          {works.map((w: any, i) => (
            <div key={w.id ?? i} className="rounded-lg border p-4">
              <p className="font-medium">{w.title || w.description || "Pratica senza titolo"}</p>
              {w.status && <p className="mt-1 text-xs text-muted-foreground">Stato: {w.status}</p>}
            </div>
          ))}
        </ListModal>

        {/* Modale: documenti */}
        <ListModal
          open={modal === "documents"}
          onOpenChange={closeModal}
          title="Documenti"
          description="Documenti caricati per questo soggetto."
          empty="Nessun documento caricato."
          isEmpty={documents.length === 0}
        >
          {documents.map((d: any, i) => (
            <div key={d.id ?? i} className="rounded-lg border p-4">
              <p className="font-medium">{d.name || d.fileName || "Documento senza nome"}</p>
            </div>
          ))}
        </ListModal>

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
