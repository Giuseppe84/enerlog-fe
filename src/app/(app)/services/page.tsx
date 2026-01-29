"use client"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react';
import { fetchServices } from '@/api/services';
import { useTranslation } from 'react-i18next';
import type { Service } from '@/types/service'

import { EmptySubject } from '@/components/emptySubjects';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceCard } from './ServiceItem';
import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import {ServiceModal} from "@/components/modals/ServiceFormModal"




export default function Page() {

  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const loadServices = async () => {
    try {
      const res = await fetchServices();
      console.log('Fetched services:', { res });
      // Ensure data is an array before setting it to state
      setServices(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch (error) {
      console.error(t('clients.error.loadingClients'), error);
      // Set empty array on error
      setServices([]);
    }
  };

  useEffect(() => {
    setPage(1);
    setQuery(searchTerm)
  }, [searchTerm]);

  useEffect(() => {

    loadServices();
  }, [page, query]);


  const filteredServices = services.filter(services =>
    (services.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );
  const addService = (newService: Service) => {
    services.push(newService)
    setServices(services);
  };

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
                    Servizi
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>






        {services.length === 0 ? <EmptySubject /> : (

          <div className="space-y-6 p-5" >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Servizi</h1>
              <Button onClick={() => setEditOpen(true)} >
                <UserPlus className="mr-2 h-4 w-4" />
                Aggiungi servizio
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
                <div className="flex flex-wrap gap-4">

                  {filteredServices.map(service => (


                    <ServiceCard service={service} key={service.id} />

                  ))}


                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Totale: {total} servizi
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Risultati per “{searchTerm}”
                    </p>
                  )}
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
        )}
        <ServiceModal isOpen={editOpen} setIsOpen={setEditOpen} service={{}} setService={(service) => addService(service)} />
      </SidebarInset>
    </SidebarProvider>
  )
}