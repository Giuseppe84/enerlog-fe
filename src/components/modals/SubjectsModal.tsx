"use client"

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { User, Building, Search, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type SubjectItem = {
  id?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  type?: 'PHYSICAL' | 'LEGAL' | string;
  [key: string]: any;
};

export type PaginatedClientSubjects = {
  data: SubjectItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

interface AssociatedSubjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Accetta sia la struttura paginata che un array diretto per retrocompatibilità
  clientSubjects?: PaginatedClientSubjects | SubjectItem[];
  // Callback opzionale nel caso in cui la paginazione sia gestita server-side
  onPageChange?: (page: number) => void;
}

export function AssociatedSubjectsModal({
  open,
  onOpenChange,
  clientSubjects,
  onPageChange,
}: AssociatedSubjectsModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [localPage, setLocalPage] = useState(1);

  // Estrazione dati e metadati paginazione
  const isPaginated = clientSubjects && 'data' in clientSubjects && 'meta' in clientSubjects;
  const subjectsList: SubjectItem[] = isPaginated 
    ? (clientSubjects as PaginatedClientSubjects).data 
    : (Array.isArray(clientSubjects) ? clientSubjects : []);

  const meta = isPaginated ? (clientSubjects as PaginatedClientSubjects).meta : null;
  const currentPage = meta?.page ?? localPage;
  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.total ?? subjectsList.length;
  const limit = meta?.limit ?? 10;

  // Filtro locale in base al termine di ricerca
  const validSubjects = subjectsList.filter(item => item && typeof item === 'object');
  const filteredSubjects = validSubjects.filter((subject) => {
    const firstName = subject?.firstName || '';
    const lastName = subject?.lastName || '';
    const companyName = subject?.companyName || '';
    const searchString = `${firstName} ${lastName} ${companyName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (onPageChange) {
      onPageChange(nextPage);
    } else {
      setLocalPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (onPageChange) {
      onPageChange(prevPage);
    } else {
      setLocalPage(prevPage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] max-w-none max-h-[85vh] flex flex-col justify-between">
        <div>
          <DialogHeader>
            <DialogTitle>{t('clientDetail.associatedSubjects.title')}</DialogTitle>
            <DialogDescription>
              Soggetti associati ({totalItems} elementi totali).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Barra di ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, cognome o azienda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Elenco soggetti */}
            {filteredSubjects.length > 0 ? (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredSubjects.map((subject, index) => {
                  const isLegal = subject.type === 'LEGAL';
                  const displayName = isLegal 
                    ? subject.companyName 
                    : `${subject.firstName || ''} ${subject.lastName || ''}`.trim();

                  // Calcolo della numerazione progressiva tenendo conto della pagina
                  const itemIndex = (currentPage - 1) * limit + index + 1;

                  return (
                    <div
                      key={subject.id || index}
                      onClick={() => {
                        if (subject.id) {
                          onOpenChange(false);
                          router.push(`/subjects/${subject.id}`);
                        }
                      }}
                      className={`p-4 border border-gray-200 rounded-lg transition-colors flex items-center gap-4 ${
                        subject.id ? 'hover:bg-gray-50 cursor-pointer' : ''
                      }`}
                    >
                      {/* Indice progressivo tenendo conto della paginazione */}
                      <span className="text-sm font-semibold text-muted-foreground w-8 text-right flex-shrink-0">
                        {itemIndex}.
                      </span>

                      {/* Icona Tipo Soggetto */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isLegal ? "bg-violet-500/10 text-violet-600" : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {isLegal ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {displayName || "Soggetto senza nome"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cod. Fiscale / P.IVA: {subject.taxCode || subject.vatNumber || "N/D"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? "Nessun soggetto corrisponde alla ricerca" : t('clientDetail.associatedSubjects.noSubjects')}
              </p>
            )}
          </div>
        </div>

        {/* Footer con Paginazione */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <span className="text-sm text-muted-foreground">
              Pagina {currentPage} di {totalPages} ({totalItems} totali)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={handlePrevPage}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={handleNextPage}
                className="gap-1"
              >
                Successiva <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}