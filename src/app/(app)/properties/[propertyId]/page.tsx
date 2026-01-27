"use client";
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
} from "lucide-react";
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
import { fetchPropertyById } from "@/api/properties"
import type { Property } from "@/types/property"
import type { Work } from "@/types/work"
import { PropertyDetailPage } from "./PropertyDetails"
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { PropertyFormModal } from "@/components/modals/PropertyFormModal";



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
    const { propertyId } = useParams<{ propertyId: string }>();
    const [initialized, setInitialized] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [property, setProperty] = useState<Property[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notFound, setNotFound] = useState(false);
    console.log('propertyId:', propertyId);

    useEffect(() => {
        if (!propertyId || initialized) return;
        const loadData = async () => {
            try {
                console.log('Loading data for propertyId:', propertyId);
                //if (!subjectId) return;

                const [propertyData] = await Promise.all([
                    fetchPropertyById(propertyId),

                    // fetchWorks(),
                ]);

                setProperty(propertyData);
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
    }, [propertyId]);


    if (loading) {
        return (

            <div className="p-6 flex items-center justify-center min-h-96">
                <p className="text-gray-500">{t('common.loading')}</p>
            </div>

        );
    }

    if (!property) {
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
                                        Edifici
                                    </BreadcrumbLink>
                                </BreadcrumbItem>

                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>

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
                                    onClick={() => { setEditOpen(true); console.log(editOpen) }}
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

                    <div className="space-y-2 mb-16">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{property.name}</h1>
                            <Badge variant="outline">{property.propertyType}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4" />
                            {property.address}, {property.city}
                            {property.province && ` (${property.province})`}
                        </div>
                    </div>
                    <Tabs defaultValue="overview"  >
                        <TabsList className="w-full">
                            <TabsTrigger value="overview">Dettagli</TabsTrigger>
                            <TabsTrigger value="properties">Impianti</TabsTrigger>
                            <TabsTrigger value="works">Pratiche</TabsTrigger>
                            <TabsTrigger value="documents">Documenti</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <PropertyDetailPage property={property} />
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

                <PropertyFormModal open={editOpen} setIsOpen={setEditOpen} property={property ?? {}} setProperty={setProperty} />
            </SidebarInset>
        </SidebarProvider>

    );
}