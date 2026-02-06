"use client"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react';
import { fetchPracticeById } from '@/api/practices';
import { fetchAvatar } from "@/api/clients"
import { useTranslation } from 'react-i18next';

import type { Client } from '@/types/client'
import { PracticesRow } from '../PracticeItem';
import { MoreHorizontal, FileText, Building2, MapPin } from "lucide-react"

import { EmptySubject } from '@/components/emptySubjects';
import { Button } from '@/components/ui/button';
import { Practice, PracticesData } from "@/types/practices";

import { Edit, Trash2, Search, UserPlus } from 'lucide-react';

import { useParams, useRouter } from "next/navigation";
import PracticeDetailPage from './PracticeDetail';

//import SearchWithFilters from "./PracticeSearchFilters"


const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
}

const typeLabels: Record<string, string> = {
  CONTO_TERMICO: "Conto Termico",
  GENERIC: "Generico",
}
export default function Page() {


  const { t } = useTranslation();
  const router = useRouter();
  const { practiceId } = useParams<{ practiceId: string }>();
  const [initialized, setInitialized] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [practice, setPractice] = useState<Practice | null>(null);

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);


  useEffect(() => {
    if (!practiceId || initialized) return;
    const loadData = async () => {
      try {
        console.log('Loading data for serviceId:', practiceId);
        //if (!subjectId) return;

        const [practiceData] = await Promise.all([
          fetchPracticeById(practiceId),
          //fetchPropertiesBySubject(serviceId),
          // fetchWorks(),
        ]);
        console.log('Practice data:', practiceData);

        setPractice(practiceData);
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
  }, [practiceId]);


  if (loading) {
    return (

      <div className="p-6 flex items-center justify-center min-h-96">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>

    );
  }

  if (!practice) {
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
                  <BreadcrumbLink href="/subjects">
                    Pratiche
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{practice?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>


            </Breadcrumb>
          </div>
        </header>





        <div className="space-y-6 p-5" >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Servizi</h1>
            <Button onClick={() => setEditOpen(true)} >
              <UserPlus className="mr-2 h-4 w-4" />
              Aggiungi pratica
            </Button>
          </div>


          <PracticeDetailPage practice={practice} />

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}