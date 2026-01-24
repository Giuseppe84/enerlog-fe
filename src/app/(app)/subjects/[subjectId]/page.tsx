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
import type { SubjectInput } from "@/types/subject"
import { fetchSubjectById } from "@/api/subjects"
import { fetchPropertiesBySubject } from "@/api/properties"
import type { Property } from "@/types/property"
import type { Work } from "@/types/work"
import SubjectDetailsCard from "./SubjectDetails"
import { SubjectModal } from "@/components/modals/SubjectFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';


// import { fetchWorks } from "@/api/works"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useTranslation } from 'react-i18next';

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const { subjectId } = useParams<{ subjectId: string }>();
  const [initialized, setInitialized] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [subject, setSubject] = useState<SubjectInput | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  console.log('subjectId:', subjectId);

  useEffect(() => {
    if (!subjectId || initialized) return;
    const loadData = async () => {
      try {
        console.log('Loading data for subjectId:', subjectId);
        //if (!subjectId) return;

        const [subjectData] = await Promise.all([
          fetchSubjectById(subjectId),
          fetchPropertiesBySubject(subjectId),
          // fetchWorks(),
        ]);
        console.log('Subject data:', subjectData);
        console.log('Properties data:', properties);
        setSubject(subjectData);
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
  }, [subjectId]);


  if (loading) {
    return (

      <div className="p-6 flex items-center justify-center min-h-96">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>

    );
  }

  if (!subject) {
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
                    Soggetti
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{subject?.companyName ? subject.companyName : `${subject.firstName || ''} ${subject.lastName || ''}`.trim()}</BreadcrumbPage>
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
          <Tabs defaultValue="overview" >
            <TabsList>
              <TabsTrigger value="overview">Dati anagrafici</TabsTrigger>
              <TabsTrigger value="properties">Immobili</TabsTrigger>
              <TabsTrigger value="works">Pratiche</TabsTrigger>
                  <TabsTrigger value="documents">Documenti</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <SubjectDetailsCard subject={subject as any} setSubject={setSubject} />
            </TabsContent>
            <TabsContent value="properties">
              <div>immobili</div>
            </TabsContent>
            <TabsContent value="works">
              <div>pratiche</div>
            </TabsContent>
               <TabsContent value="documents">
              <div>Documenti</div>
            </TabsContent>
          </Tabs>

        </div>
        <SubjectModal isOpen={editOpen} setIsOpen={setEditOpen} subject={subject ?? {}} setSubject={setSubject} />
      </SidebarInset>
    </SidebarProvider>

  );
}