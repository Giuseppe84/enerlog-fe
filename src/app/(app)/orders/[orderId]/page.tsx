"use client";
import { useState, useEffect } from "react"
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
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from "next/navigation";
import type { Order } from "@/types/order"
import { fetchOrderById } from "@/api/orders"

import {OrderDetail} from "./OrderDetail"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';


import { useTranslation } from 'react-i18next';


export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const [initialized, setInitialized] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
 

  useEffect(() => {
    if (!orderId || initialized) return;
    const loadData = async () => {
      try {
        console.log('Loading data for serviceId:', orderId);
        //if (!subjectId) return;

        const [orderData] = await Promise.all([
          fetchOrderById(orderId),
          //fetchPropertiesBySubject(serviceId),
          // fetchWorks(),
        ]);
        console.log('Subject data:', orderData);
      
        setOrder(orderData);
        //setProperties(propertiesData || []);
        setInitialized(true);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orderId]);


  if (loading) {
    return (

      <div className="p-6 flex items-center justify-center min-h-96">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>

    );
  }

  if (!order) {
    return (

      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-4">{t('clientDetail.notFound')}</p>
          <Button variant="default" onClick={() => router.back()}>
            {t('common.back')}
          </Button>
        </div>
      </div>

    );
  }
  return (
 
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/orders">
                    Ordini
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{order?.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="m-4">
          <div className=" flex justify-end absolute top-4 right-4">
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                Modifica
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsDeleting(true)}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
              <OrderDetail order={order as Order} />

        </div>

      </SidebarInset>
    </SidebarProvider>

  );
}