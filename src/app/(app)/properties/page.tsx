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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Search , UserPlus} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { fetchProperties, deleteProperty } from '@/api/properties';
import type { Property } from '@/types/property';
import { EmptyProperties } from '@/components/emptyProperties';
import {PropertyCard} from "./PropertyItem";


export default function page() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();
    const [newProperty, setNewProperty] = useState<Partial<Property>>({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [isModalNewPropertyOpen, setIsModalNewPropertyOpen] = useState(false);



  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);


    // Placeholder clients list - if you have a real list, fetch it and replace this






    useEffect(() => {
        const loadProperties = async () => {
            try {
                const result = await fetchProperties();
                console.log('Immobili caricati:', result.data);
                setProperties(result.data);
            } catch (error) {
                console.error(t('properties.error.loadingProperties'), error);
            }
        };
        loadProperties();
    }, [t]);

    const filteredProperties = properties.filter(p =>
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())

    );

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setIsModalNewPropertyOpen(false);
        setNewProperty({});
    };

    const handleEdit = (property: Property) => {
        setNewProperty({ ...property });
        setOpen(true);
    };

    const handleDeleteClick = (property: Property) => {
        setPropertyToDelete(property);
        setDeleteDialogOpen(true);
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
                                        Edifici
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div>

                


        {properties.length === 0 ? <EmptyProperties /> : (

          <div className="space-y-6 p-5" >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Soggetti</h1>
              <Button onClick={() => setEditOpen(true)} >
                <UserPlus className="mr-2 h-4 w-4" />
                Aggiungi edificio
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
                <div className="flex flex-col gap-4">
                  {filteredProperties.map(property => (


                    <PropertyCard property={property} key={property.id} />

                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Totale: {total} soggetti
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

                </div>
            </SidebarInset>
        </SidebarProvider>

    )
}