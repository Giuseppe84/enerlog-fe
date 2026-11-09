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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus } from 'lucide-react';

import { fetchClients } from '@/api/clients';

import { ClientFormModal } from '@/components/forms/ClientFormModal';
import { DeleteClientModal } from '@/components/modals/DeleteClientModal';

import type { Client } from '@/types/client'
import { useTranslation } from 'react-i18next';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import ClientItem from "./ClientItem"

export default function Page() {

  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState<Client>({ id: '', firstName: '', lastName: '', taxCode: '', vatNumber: '', email: '', phone: '', createdAt: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetchClients();
        console.log('Fetched clients:', { clients });
        setClients(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
      } catch (error) {
        console.error(t('clients.error.loadingClients'), error);
        setClients([]);
      }
    };
    loadClients();
  }, [t]);

  const handleOpen = () => setOpen(true);

  const handleDeleteCancel = () => {
    setClientToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
    }
    handleDeleteCancel();
  };

  const filteredClients = clients.filter(client =>
    (client.firstName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (client.lastName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
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
                    Clienti
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="space-y-6 p-5">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('clients.title')}</h1>
              <p className="text-muted-foreground">{t('clients.subtitle')}</p>
            </div>
            <Button onClick={handleOpen} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('clients.addClient')}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('clients.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('clients.listTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Soggetto</TableHead>
                    <TableHead>P.IVA / Codice fiscale</TableHead>
                    <TableHead>Data Creazione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nessun cliente trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <ClientItem client={client} key={client.id} />
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Totale: {total} elementi
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

          <ClientFormModal isOpen={open} client={newClient} setIsOpen={setOpen} setClient={setNewClient} />
          <DeleteClientModal
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            clientToDelete={clientToDelete}
            handleDeleteCancel={handleDeleteCancel}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}