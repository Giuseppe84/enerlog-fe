"use client"

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Search, MapPin, FileText, Info, Zap, User } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Importa l'interfaccia Property dal tuo file di tipi
import type { Property } from '@/types/property'; 

interface PropertiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties?: Property[];
}

export function PropertiesModal({
  open,
  onOpenChange,
  properties = [],
}: PropertiesModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stato per l'immobile selezionato per il modale di dettaglio
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filtra gli immobili in base a nome, indirizzo, città o dati catastali
  const filteredProperties = properties.filter((property) => {
    const fullAddress = `${property.name || ''} ${property.address || ''} ${property.city || ''} ${property.municipality || ''}`.toLowerCase();
    
    // Ricerca anche nei dati catastali
    const cadastralMatch = property.cadastralData?.some((c) => {
      const cadString = `${c.sheet || ''} ${c.parcel || ''} ${c.subaltern || ''} ${c.category || ''} ${c.municipality || ''}`.toLowerCase();
      return cadString.includes(searchTerm.toLowerCase());
    });

    const query = searchTerm.toLowerCase();

    return fullAddress.includes(query) || cadastralMatch;
  });

  return (
    <>
      {/* MODALE LISTA IMMOBILI */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Immobili e Proprietà Associati</DialogTitle>
            <DialogDescription>
              Elenco degli immobili collegati con indirizzo, dettagli e dati catastali.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Campo di ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, indirizzo, città o dati catastali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Elenco Immobili */}
            {filteredProperties.length > 0 ? (
              <div className="space-y-3">
                {filteredProperties.map((property, index) => {
                  const location = [
                    property.zip,
                    property.city || property.municipality,
                    property.province ? `(${property.province})` : null
                  ].filter(Boolean).join(' ');

                  const mainCadastral = property.cadastralData?.[0];

                  return (
                    <div
                      key={property.id || index}
                      onClick={() => setSelectedProperty(property)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                    >
                      {/* Numerazione Progressiva */}
                      <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                        {index + 1}.
                      </span>

                      {/* Icona Immobile */}
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>

                      {/* Info Principali */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {property.name || property.address || "Immobile senza nome"}
                          </h3>
                          {property.propertyType && (
                            <Badge variant="outline" className="text-xs">
                              {property.propertyType}
                            </Badge>
                          )}
                        </div>

                        {property.address && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{property.address} {location && `- ${location}`}</span>
                          </p>
                        )}

                        {/* Sintesi Dati Catastali (Mostra il primo record se presente) */}
                        {mainCadastral && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 font-mono">
                            {mainCadastral.category && <span className="font-semibold">Cat. {mainCadastral.category}</span>}
                            {mainCadastral.sheet && <span>Fg. {mainCadastral.sheet}</span>}
                            {mainCadastral.parcel && <span>Part. {mainCadastral.parcel}</span>}
                            {mainCadastral.subaltern && <span>Sub. {mainCadastral.subaltern}</span>}
                            {property.cadastralData.length > 1 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                +{property.cadastralData.length - 1} altri
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? "Nessun immobile corrisponde alla ricerca" : "Nessun immobile associato."}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* SECONDARY MODAL: DETTAGLI IMMOBILE SELEZIONATO */}
      <Dialog open={!!selectedProperty} onOpenChange={(isOpen) => !isOpen && setSelectedProperty(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              {selectedProperty?.name || "Dettaglio Immobile"}
            </DialogTitle>
            <DialogDescription>
              Scheda informativa completa dell&apos;unità immobiliare.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4 pt-2">
              {/* Sezione Proprietà & Proprietario */}
              {selectedProperty.owner && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 uppercase">Proprietario</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProperty.owner.firstName} {selectedProperty.owner.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Sezione Ubicazione */}
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ubicazione</p>
                <p className="text-base font-medium">{selectedProperty.address}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedProperty.zip} {selectedProperty.city || selectedProperty.municipality} ({selectedProperty.province})
                </p>
              </div>

              {/* Dettagli Generali (Tipologia, Superficie, Classe Energetica) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-lg text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Tipo Immobile</span>
                  <span className="font-medium">{selectedProperty.propertyType || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Destinazione Uso</span>
                  <span className="font-medium">{selectedProperty.usageDestination || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Stato Conservativo</span>
                  <span className="font-medium">{selectedProperty.conditionStatus || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Sup. Commerciale</span>
                  <span className="font-medium">{selectedProperty.supCommercial ? `${selectedProperty.supCommercial} m²` : "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Piano</span>
                  <span className="font-medium">{selectedProperty.floorNumber ?? "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Cl. Energetica
                  </span>
                  <span className="font-medium">{selectedProperty.energyClass || "-"}</span>
                </div>
              </div>

              {/* Sezione Dati Catastali (Supporta più elementi) */}
              <div className="p-3 border rounded-lg space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Dati Catastali ({selectedProperty.cadastralData?.length || 0})
                </p>

                {selectedProperty.cadastralData && selectedProperty.cadastralData.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProperty.cadastralData.map((cad, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-50 border rounded-md grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Comune</span>
                          <span className="font-medium">{cad.municipality || cad.municipalityCode || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Categoria</span>
                          <span className="font-semibold">{cad.category || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Foglio</span>
                          <span className="font-medium">{cad.sheet || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Particella</span>
                          <span className="font-medium">{cad.parcel || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Subalterno</span>
                          <span className="font-medium">{cad.subaltern || "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nessun dato catastale inserito.</p>
                )}
              </div>

              {/* Note opzionali */}
              {selectedProperty.notes && (
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Info className="w-4 h-4" /> Note
                  </p>
                  <p className="text-sm text-gray-700">{selectedProperty.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}