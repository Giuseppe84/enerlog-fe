"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Order } from "@/types/order"
import { fetchOrderById } from "@/api/orders"

import { OrderDetail } from "./OrderDetail"

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  // TODO: collega questi stati ai dialog di modifica / eliminazione
  const [editOpen, setEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    setLoading(true)

    fetchOrderById(orderId)
      .then((data) => !cancelled && setOrder(data))
      .catch((error) => {
        console.error("Errore nel caricamento dell'ordine:", error)
        if (!cancelled) setOrder(null)
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-red-600">{t("clientDetail.notFound")}</p>
          <Button variant="default" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    )
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
                  <BreadcrumbLink href="/orders">Ordini</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{order.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl p-6">
          <OrderDetail
            order={order}
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Azioni ordine">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleting(true)}
                    className="gap-2 text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
