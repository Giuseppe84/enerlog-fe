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

  const [subject, setSubject] = useState<SubjectInput | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
console.log('subjectId:', subjectId);

  useEffect(() => {
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

      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setSubject(null);
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
                  <BreadcrumbLink href="#">
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
        <div className=" m-4">
          <Tabs defaultValue="overview" >
            <TabsList>
              <TabsTrigger value="overview">Dati anagrafici</TabsTrigger>
              <TabsTrigger value="properties">Immobili</TabsTrigger>
              <TabsTrigger value="works">Pratiche</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <SubjectDetailsCard subject={subject as any} />
            </TabsContent>
               <TabsContent value="properties">
              <div>immobili</div>
            </TabsContent>
               <TabsContent value="works">
          <div>proprietà</div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>

  );
}