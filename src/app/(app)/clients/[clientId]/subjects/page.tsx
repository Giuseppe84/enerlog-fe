"use client"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react';
import { fetchSubjects } from '@/api/subjects';
import { useTranslation } from 'react-i18next';
import type { Subject } from '@/types/subject'

import {EmptySubject} from '@/components/emptySubjects';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import SubjectItem from "./SubjectItem";


export default function Page() {

  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetchSubjects();
        console.log('Fetched subjects:', { subjects });
        // Ensure data is an array before setting it to state
        setSubjects(Array.isArray(res.data) ? res.data : []);

      } catch (error) {
        console.error(t('clients.error.loadingClients'), error);
        // Set empty array on error
        setSubjects([]);
      }
    };
    loadSubjects();
  }, [t]);


  const filteredSubjects = subjects.filter(subject =>
    (subject.firstName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (subject.lastName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) 
  );


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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>






      {subjects.length === 0 ? <EmptySubject   /> : subjects.map(subject => (


      
        <div className="space-y-6 p-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Soggetti</h1>
                    <Button onClick={() => {/* Apri modal per aggiungere soggetto */ }} >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Aggiungi soggetto
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cerca soggetto"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('clients.listTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                            {subjects.map(subject => (


                          <SubjectItem subject={subject} />

                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-muted-foreground">
                                Totale: {total} soggetti
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Precedente
                                </Button>

                                <span className="text-sm">
                                    Pagina {page} di {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Successiva
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
      ))}

      </SidebarInset>
    </SidebarProvider>
  ) 
}