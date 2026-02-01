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
import { fetchOrders } from '@/api/orders';
import { useTranslation } from 'react-i18next';
import type { Order , OrdersFilter} from '@/types/order'

import { EmptySubject } from '@/components/emptySubjects';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import { ServiceModal } from "@/components/modals/ServiceFormModal"
import OrderCard from './OrderItem';
import SearchWithFilters from "./OrderSearchFilters"


export default function Page() {

  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [filters, setFilters] = useState({
    clientId: "",
    status: "",
    unpaidOnly: false,
    createdAfter: "",
    createdBefore: "",
  });
  const loadOrders = async () => {
    try {


      const { data, meta } = await fetchOrders(filters);

      console.log('Fetched orders data:', data);
      console.log('meta:', meta);
      // Ensure data is an array before setting it to state
      setOrders(Array.isArray(data) ? data : []);

      console.log('orders:', orders);
      setTotalPages(meta.totalPages);

      setTotal(meta.total);
    } catch (error) {
      console.error(t('clients.error.loadingOrder'), error);
      // Set empty array on error
      setOrders([]);
    }
  };
  useEffect(() => {
    setPage(1);
    loadOrders()
  }, [filters]);


  useEffect(() => {
    setPage(1);
    setQuery(searchTerm)
  }, [searchTerm]);

  useEffect(() => {

    loadOrders();
  }, [page, query]);


  const filteredOrders = orders.filter(orders =>
    (orders.code?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
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
                  <BreadcrumbLink href="/subjects">
                    Ordini
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
                Aggiungi ordine
              </Button>
            </div>

            <div className="relative">
           
              <SearchWithFilters filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

             {orders.length === 0 ? <EmptySubject /> : (<Card>
              <CardHeader>
                <CardTitle>{t('clients.listTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col  gap-4">

                  {filteredOrders.map(order => (


                    <OrderCard order={order} key={order.id} />

                  ))}


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
            </Card>     )}

          </div>
   



      </SidebarInset>
    </SidebarProvider>
  )
}