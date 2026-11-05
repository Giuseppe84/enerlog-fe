"use client"
import { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { fetchClientById, fetchAvatar } from '@/api/clients';
import { useParams, useRouter } from "next/navigation";
import { User, FileText, Users, DollarSign, Calendar, IdCard, TrendingUp, House, MoreVertical, Pencil, Trash2, Briefcase, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Client } from '@/types/client';
import { ClientFormModal } from '@/components/modals/ClientFormModal';
import { DeleteClientModal } from '@/components/modals/DeleteClientModal';

import Image from "next/image";
import ImageUploadModal from '@/components/modals/ImageUploadModal';
import { TagButtons } from '@/components/tags';
import { AssociatedSubjectsModal } from '@/components/modals/AssociatedSubjectsModal';

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
  const [avatar, setAvatar] = useState<string | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Stati per la gestione dei modali di dettaglio
  const [demographicsModalOpen, setDemographicsModalOpen] = useState(false);
  const [worksModalOpen, setWorksModalOpen] = useState(false);
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);

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
        if (!clientId) return;
        const [clientData] = await Promise.all([
          fetchClientById(clientId),
          fetchAvatar(clientId),
        ]);
        setClient(clientData);
        const avatarUrl = await fetchAvatar(clientId);
        setAvatar(avatarUrl);
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

  const clientName = client.companyName ? client.companyName : `${client.firstName || ''} ${client.lastName || ''}`.trim();
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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{clientName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="space-y-6 p-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" onClick={() => router.back()}>
              ← {t('common.back')}
            </Button>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                    <Pencil className="w-4 h-4" /> Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAvatarModalOpen(true)} className="gap-2">
                    <Pencil className="w-4 h-4" /> Avatar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleting(true)} className="gap-2 text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4" /> Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${clientName} avatar`}
                  width={90}
                  height={90}
                  unoptimized
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-accent rounded-2xl shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-accent rounded-2xl bg-gray-200 flex items-center justify-center shadow-md">
                  <span className="text-xs text-gray-400">No Image</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{clientName}</h1>
                <p className="text-sm text-gray-600 mt-1">{t('clientDetail.taxCode')}: {client.taxCode}</p>
                <div className="mt-2">
                  <TagButtons tags={client?.tags || []} />
                </div>
              </div>
            </div>

            <Button onClick={() => setDemographicsModalOpen(true)} variant="default" className="gap-2">
              <Eye className="w-4 h-4" /> Visualizza Anagrafica
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Pulsanti di accesso rapido tramite Modali */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sezioni e Relazioni</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setWorksModalOpen(true)}
              >
                <Briefcase className="w-6 h-6 text-primary" />
                <span>Lavori / Pratiche ({totalWorks})</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setSubjectsModalOpen(true)}
              >
                <Users className="w-6 h-6 text-primary" />
                <span>Soggetti Associati ({client.clientSubjects?.length || 0})</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setPaymentsModalOpen(true)}
              >
                <DollarSign className="w-6 h-6 text-primary" />
                <span>Pagamenti ({payments.length})</span>
              </Button>
            </CardContent>
          </Card>

          {/* MODALE ANAGRAFICA */}
          <Dialog open={demographicsModalOpen} onOpenChange={setDemographicsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('clientDetail.demographics.title')}</DialogTitle>
                <DialogDescription>Dati anagrafici e fiscali dettagliati del cliente.</DialogDescription>
              </DialogHeader>

              {client.type == 'LEGAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                </div>
              )}

              {client.type == 'PHYSICAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InfoSection icon={User} label={t('clientDetail.demographics.physical.name')} value={`${client.firstName} ${client.lastName}`} />
                  <InfoSection icon={IdCard} label={t('clientDetail.demographics.physical.taxCode')} value={`${client.taxCode} `} />
                  {client.address && <InfoSection icon={House} label={t('clientDetail.demographics.physical.address')} value={`${client.address} `} />}
                  {client.city && <InfoSection icon={User} label={t('clientDetail.demographics.physical.city')} value={`${client.zip} ${client.city} (${client.province})`} />}
                  {client.email && <InfoSection icon={User} label={t('clientDetail.demographics.email')} value={client.email} />}
                  {client.phone && <InfoSection icon={User} label={t('clientDetail.demographics.phone')} value={client.phone} />}
                  <InfoSection icon={Calendar} label={t('clientDetail.demographics.registrationDate')} value={format(new Date(client.createdAt), 'd MMMM yyyy', { locale: it })} />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* MODALE LAVORI / PRATICHE */}
          <Dialog open={worksModalOpen} onOpenChange={setWorksModalOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('clientDetail.associatedWorks.title')}</DialogTitle>
                <DialogDescription>Elenco completo dei lavori e delle pratiche collegate.</DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                {works.length > 0 ? (
                  <div className="space-y-3">
                    {works.map(work => (
                      <div
                        key={work.id}
                        onClick={() => router.push(`/work/${work.id}`)}
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
              </div>
            </DialogContent>
          </Dialog>

          {/* MODALE SOGGETTI ASSOCIATI */}
          <AssociatedSubjectsModal
            open={subjectsModalOpen}
            onOpenChange={setSubjectsModalOpen}
            clientSubjects={client.clientSubjects}
          />

          {/* MODALE PAGAMENTI */}
          <Dialog open={paymentsModalOpen} onOpenChange={setPaymentsModalOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('clientDetail.paymentsSection.title')}</DialogTitle>
                <DialogDescription>Storico dei pagamenti registrati.</DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map(payment => (
                      <div
                        key={payment.id}
                        onClick={() => router.push(`/payment/${payment.id}`)}
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
              </div>
            </DialogContent>
          </Dialog>

          <ClientFormModal isOpen={editOpen} client={client} setIsOpen={setEditOpen} setClient={setClient} />
          <ImageUploadModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} onComplete={() => { console.log('Image uploaded') }} clientId={client?.id} />
        </div>

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