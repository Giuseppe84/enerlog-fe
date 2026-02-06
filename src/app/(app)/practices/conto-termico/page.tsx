"use client"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react';
import { fetchPractices } from '@/api/practices';
import { fetchAvatar } from "@/api/clients"
import { useTranslation } from 'react-i18next';

import type { Client } from '@/types/client'
import { PracticesRow } from '../PracticeItem';
import { MoreHorizontal, FileText, Building2, MapPin } from "lucide-react"

import { EmptySubject } from '@/components/emptySubjects';
import { Button } from '@/components/ui/button';
import { Practice, PracticesData } from "@/types/practices";

import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import SearchWithPracticeFilters from "../PracticesSearchFilters"
import { useParams, useRouter } from "next/navigation";


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
    const { type } = useParams<{ type: string }>();
    const { t } = useTranslation();
    const [practices, setPractices] = useState<Practice[]>([]);
    const [initialized, setInitialized] = useState(false);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [client, setClient] = useState<Client>({})
    const [clientAvatar, setClientAvatar] = useState<Record<string, string>>({})
    const [filters, setFilters] = useState({
        query: "",
        clientId: null,
        subjectId: null,
        interventionTypeId: "",
        practiceCode: "",
        type: "",
        status: "",
        ctStatus: "",
        fromDate: "",
        toDate: "",
        submittedFromDate: "",
        submittedToDate: "",
        approvedFromDate: "",
        approvedToDate: "",
        valueFromDate: "",
        valueToDate: "",
    });
    const formatDate = (dateString: string | null) => {
        if (!dateString || dateString === "1970-01-01T00:00:00.000Z") return "-"
        return new Date(dateString).toLocaleDateString("it-IT")
    }

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: "EUR",
        }).format(parseFloat(amount))
    }

    const getClientName = (client: Practice["subject"]) => {
        if (client.companyName) return client.companyName
        if (client.firstName && client.lastName) {
            return `${client.firstName} ${client.lastName}`
        }
        return "-"
    }

    const loadPractices = async () => {

        try {
            if (!type || initialized) return;

            console.log(filters);
            const practices = await fetchPractices(filters);

            console.log('Fetched practices data:', practices.data);
            console.log('meta:', practices.meta);
            // Ensure data is an array before setting it to state
            setPractices(Array.isArray(practices.data) ? practices.data : []);

            console.log(practices.data);


            console.log('practices:', practices);
            setTotalPages(practices.meta.pages);

            setTotal(practices.meta.total);
        } catch (error) {
            console.error(t('clients.error.loadingOrder'), error);
            // Set empty array on error
            setPractices([]);
        }
    };
    const avatarCache = new Map<string, string>()


    useEffect(() => {
        console.log(filters)
        const typeUpperCase = type
            ?.trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_');
        setFilters({ ...filters, type: typeUpperCase })
        loadPractices()
    }, [type]);


    useEffect(() => {
        console.log(filters)
        setPage(1);
        loadPractices()
    }, [filters]);


    useEffect(() => {
        setPage(1);
        setQuery(searchTerm)
    }, [searchTerm]);

    useEffect(() => {

        loadPractices();
    }, [page, query]);


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


                    <div className="relative">

                        <SearchWithPracticeFilters filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </div>


                    {practices.length === 0 ? <EmptySubject /> : (



                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Pratiche</CardTitle>
                                <CardDescription>
                                    Gestione delle pratiche  ({total} totali)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome Pratica</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Soggetto</TableHead>
                                                <TableHead>Contributori</TableHead>
                                                <TableHead>Proprietà</TableHead>

                                                <TableHead>Data Creazione</TableHead>
                                                <TableHead className="text-right">Azioni</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {practices.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                                                        Nessuna pratica trovata
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                practices.map((practice) => (
                                                    <PracticesRow practice={practice} key={practice.id} />
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>




                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Totale: {total} ordini
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
                        </Card>)}

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}