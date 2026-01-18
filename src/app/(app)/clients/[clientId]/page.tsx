"use client"
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { fetchClientById } from '@/api/clients';
import { fetchWorks } from '@/api/works';
import { fetchPayments } from '@/api/payments';
import { useParams, useRouter } from "next/navigation";
import { User, FileText, Users, DollarSign, Calendar, IdCard, TrendingUp, House } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Client } from '@/types/client';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { ClientFormModal } from '../modals/ClientFormModal';
import { DeleteClientModal } from '../modals/DeleteClientModal';

import { AppSidebar } from "@/components/sidebar/app-sidebar"

import Image from "next/image";



type Work = {
  id: string;
  description: string;
  amount: number;
  status: string;
  service?: { name: string };
  client?: { id: string; name: string };
};

type Payment = {
  id: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};


const InfoSection = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className: string }>; label: string; value: string | React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 font-medium mt-1">{value}</p>
    </div>
  </div>
);


const getStatusLabel = (status: string, t: (key: string) => string) => {
  const labels: Record<string, string> = {
    TO_START: t('clientDetail.workStatus.toStart'),
    IN_PROGRESS: t('clientDetail.workStatus.inProgress'),
    COMPLETED: t('clientDetail.workStatus.completed'),
    CANCELED: t('clientDetail.workStatus.canceled'),
    pending: t('clientDetail.paymentStatus.pending'),
    completed: t('clientDetail.paymentStatus.completed'),
    failed: t('clientDetail.paymentStatus.failed'),
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    TO_START: 'bg-yellow-50 text-yellow-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELED: 'bg-red-50 text-red-700',
    pending: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
  };
  return colors[status] || 'bg-gray-50 text-gray-700';
};

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();

  const [client, setClient] = useState<Client | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const totalWorks = works.length;
  const totalWorkAmount = works.reduce((sum, work) => sum + (work.amount || 0), 0);
  const completedWorks = works.filter(w => w.status === 'COMPLETED').length;
  const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(clientId);
        if (!clientId) return;
        const [clientData] = await Promise.all([
          fetchClientById(clientId),
          //fetchWorks(),
          //fetchPayments(),
        ]);
        console.log(clientData);
        setClient(clientData);





      } catch (error) {
        console.error(t('clientDetail.error.loadingData'), error);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientId, t]);

  if (loading) {
    return (

      <div className="p-6 flex items-center justify-center min-h-96">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>

    );
  }

  if (!client) {
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
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  const handleDeleteCancel = () => {
    setClientToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {

    handleDeleteCancel();
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
                  <BreadcrumbLink href="#">
                    Clienti
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>


        <div className="space-y-6 p-5">
          <div className="space-y-6">









            <div>
              <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Button variant="outline" onClick={() => router.back()} className="mb-4">
                      ← {t('common.back')}
                    </Button>
                    <Card className="w-54 h-54 border-4 border-white rounded-xl shadow-lg overflow-hidden  flex flex-col items-center">
                      {client.avatar ? (
                        <div className=" w-50 h-50">
                          <Image
                            src={client.avatar}
                            alt={`${clientName} avatar`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}

                
                    </Card>

                    <h1 className="text-3xl font-bold text-gray-900">{clientName}</h1>
                    <p className="text-gray-600 mt-2">{t('clientDetail.taxCode')}: {client.taxCode}</p>
                  </div>
                  <Badge variant="outline" className="h-fit">
                    {client.clientSubjects?.length || 0} {t('clientDetail.subjects', { count: client.clientSubjects?.length || 0 })}
                  </Badge>
                  <div className="flex items-center gap-2">


                    <DropdownMenu>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-blue-900">{totalWorks}</p>
                        <p className="text-sm text-blue-700 mt-1">{t('clientDetail.totalWorks')}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-green-900">{completedWorks}</p>
                        <p className="text-sm text-green-700 mt-1">{t('clientDetail.completedWorks')}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-900">€ {totalWorkAmount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
                        <p className="text-sm text-purple-700 mt-1">{t('clientDetail.works')}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-900">€ {totalPaymentAmount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
                        <p className="text-sm text-orange-700 mt-1">{t('clientDetail.payments')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="demographics" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="demographics">{t('clientDetail.tabs.demographics')}</TabsTrigger>
                    <TabsTrigger value="works">{t('clientDetail.tabs.works', { count: totalWorks })}</TabsTrigger>
                    <TabsTrigger value="subjects">{t('clientDetail.tabs.subjects', { count: client.clientSubjects?.length || 0 })}</TabsTrigger>
                    <TabsTrigger value="payments">{t('clientDetail.tabs.payments', { count: payments.length })}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="demographics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('clientDetail.demographics.title')}</CardTitle>
                      </CardHeader>


                      {client.type == 'LEGAL' && <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoSection icon={User} label={t('clientDetail.demographics.companyName')} value={client.companyName} />
                          <InfoSection icon={IdCard} label={t('clientDetail.demographics.taxCode')} value={`${client.taxCode} / ${client.vatNumber}`} />
                          {client.legalForm && <InfoSection icon={IdCard} label={t('clientDetail.demographics.legalForm')} value={client.legalForm} />}
                          {client.reaNumber && <InfoSection icon={IdCard} label={t('clientDetail.demographics.reaNumber')} value={client.reaNumber} />}
                          {client.chamberCode && <InfoSection icon={IdCard} label={t('clientDetail.demographics.chamberCode')} value={client.chamberCode} />}
                          {client.sdiCode && <InfoSection icon={IdCard} label={t('clientDetail.demographics.sdiCode')} value={client.sdiCode} />}
                          {client.legalAddress && <InfoSection icon={House} label={t('clientDetail.demographics.legalAddress')} value={`${client.legalAddress} ${client.legalCivicNumber} `} />}
                          {client.legalCity && <InfoSection icon={User} label={t('clientDetail.demographics.city')} value={`${client.legalPostalCode} ${client.legalCity} (${client.legalProvince})`} />}
                          {client.email && <InfoSection icon={User} label={t('clientDetail.demographics.email')} value={client.email} />}
                          {client.pecEmail && <InfoSection icon={User} label={t('clientDetail.demographics.pecEmail')} value={client.pecEmail} />}
                          {client.phone && <InfoSection icon={User} label={t('clientDetail.demographics.phone')} value={client.phone} />}
                          <InfoSection icon={Calendar} label={t('clientDetail.demographics.registrationDate')} value={format(new Date(client.createdAt), 'd MMMM yyyy', { locale: it })} />
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('clientDetail.demographics.status')}</p>
                              <p className="text-sm text-gray-900 font-medium mt-1">{t('clientDetail.demographics.active')}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      }
                      {client.type == 'PHYSICAL' && <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoSection icon={User} label={t('clientDetail.demographics.physical.name')} value={`${client.firstName} ${client.lastName}`} />
                          <InfoSection icon={IdCard} label={t('clientDetail.demographics.physical.taxCode')} value={`${client.taxCode} `} />

                          {client.address && <InfoSection icon={House} label={t('clientDetail.demographics.physical.address')} value={`${client.address} `} />}
                          {client.city && <InfoSection icon={User} label={t('clientDetail.demographics.physical.city')} value={`${client.zip} ${client.city} (${client.province})`} />}
                          {client.email && <InfoSection icon={User} label={t('clientDetail.demographics.email')} value={client.email} />}

                          {client.phone && <InfoSection icon={User} label={t('clientDetail.demographics.phone')} value={client.phone} />}
                          <InfoSection icon={Calendar} label={t('clientDetail.demographics.registrationDate')} value={format(new Date(client.createdAt), 'd MMMM yyyy', { locale: it })} />
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('clientDetail.demographics.status')}</p>
                              <p className="text-sm text-gray-900 font-medium mt-1">{t('clientDetail.demographics.active')}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      }

                    </Card>
                  </TabsContent>

                  <TabsContent value="works" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('clientDetail.associatedWorks.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {works.length > 0 ? (
                          <div className="space-y-3">
                            {works.map(work => (
                              <div
                                key={work.id}
                                onClick={() => navigate(`/work/${work.id}`)}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{work.service?.name || work.description}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                                    <p className="text-sm font-medium text-gray-900 mt-2">€ {work.amount?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                                  </div>
                                  <Badge className={getStatusColor(work.status)}>
                                    {getStatusLabel(work.status, t)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">{t('clientDetail.associatedWorks.noWorks')}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="subjects" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('clientDetail.associatedSubjects.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {client.clientSubjects && client.clientSubjects.length > 0 ? (
                          <div className="space-y-3">
                            {client.clientSubjects.map(({ subject, isSamePerson }, index) => (
                              <div
                                key={index}
                                onClick={() => subject.id && navigate(`/subject/${subject.id}`)}
                                className={`p-4 border border-gray-200 rounded-lg transition-colors ${subject.id ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <User className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h3 className="font-medium text-gray-900">{subject.firstName} {subject.lastName}</h3>
                                      {isSamePerson && (
                                        <Badge variant="secondary" className="mt-2">
                                          {t('clientDetail.associatedSubjects.samePerson')}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">{t('clientDetail.associatedSubjects.noSubjects')}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('clientDetail.paymentsSection.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {payments.length > 0 ? (
                          <div className="space-y-3">
                            {payments.map(payment => (
                              <div
                                key={payment.id}
                                onClick={() => navigate(`/payment/${payment.id}`)}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">€ {payment.amount?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-600 mt-1">{t('clientDetail.paymentsSection.method')}: {payment.paymentMethod}</p>
                                    <p className="text-xs text-gray-500 mt-2">{format(new Date(payment.createdAt), 'd MMM yyyy', { locale: it })}</p>
                                  </div>
                                  <Badge className={getStatusColor(payment.paymentStatus)}>
                                    {getStatusLabel(payment.paymentStatus, t)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">{t('clientDetail.paymentsSection.noPayments')}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              <ClientFormModal isOpen={editOpen} client={client} setIsOpen={setEditOpen} setClient={setClient} />
            </div>


          </div>
        </div >
        <DeleteClientModal
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          clientToDelete={clientToDelete}
          handleDeleteCancel={handleDeleteCancel}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}