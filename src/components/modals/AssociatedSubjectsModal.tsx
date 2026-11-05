"use client"

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { User, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export type ClientSubjectItem = {
  subject: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
  isSamePerson?: boolean;
};

interface AssociatedSubjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSubjects?: ClientSubjectItem[];
}

export function AssociatedSubjectsModal({
  open,
  onOpenChange,
  clientSubjects = [],
}: AssociatedSubjectsModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra i soggetti in base al termine di ricerca (nome o cognome)
  const filteredSubjects = clientSubjects.filter(({ subject }) => {
    const fullName = `${subject.firstName || ''} ${subject.lastName || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('clientDetail.associatedSubjects.title')}</DialogTitle>
          <DialogDescription>Soggetti associati.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o cognome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista dei soggetti filtrata con numerazione */}
          {filteredSubjects.length > 0 ? (
            <div className="space-y-3">
              {filteredSubjects.map(({ subject, isSamePerson }, index) => (
                <div
                  key={subject.id || index}
                  onClick={() => {
                    if (subject.id) {
                      onOpenChange(false); // Chiude il modale al click
                      router.push(`/subject/${subject.id}`);
                    }
                  }}
                  className={`p-4 border border-gray-200 rounded-lg transition-colors flex items-center gap-4 ${
                    subject.id ? 'hover:bg-gray-50 cursor-pointer' : ''
                  }`}
                >
                  {/* Numerazione progressiva */}
                  <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                    {index + 1}.
                  </span>

                  <div className="flex items-start gap-3 flex-1">
                    <User className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {subject.firstName} {subject.lastName}
                      </h3>
                      {isSamePerson && (
                        <Badge variant="secondary" className="mt-2">
                          {t('clientDetail.associatedSubjects.samePerson')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? "Nessun soggetto corrisponde alla ricerca" : t('clientDetail.associatedSubjects.noSubjects')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}