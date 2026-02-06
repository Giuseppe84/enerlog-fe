import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MapPin,
  Home,
  Ruler,
  Zap,
  User,
  Building2,
} from "lucide-react";
import dayjs from "dayjs";
import { Property } from "@/types/property";
import { EnergyClassBadge } from "@/components/energy-class-badge";
import { getBuildingType, getUsageDestination, getEnergyUsageType, getCadastralCategory } from "@/data/properties"
import { useEffect, useState } from "react";
import  EnergyClassScale from "@/components/fields/energy-class-scale"
interface PropertyDetailPageProps {
  property: Property;
}

function Info({ label, value }: { label: string; value?: any }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground `${className}`">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function formatMq(value?: number) {
  return value ? `${value} m²` : undefined;
}


export function PropertyDetailPage({ property }: PropertyDetailPageProps) {

  const bt = getBuildingType(property.buildingType);
  const ud = getUsageDestination(property.usageDestination);
  const eu = getEnergyUsageType(property.energyUsageType);


  return (
    <div className="space-y-6">

      {/* HEADER */}


      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-2 space-y-6">

          {/* DATI GENERALI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dati generali
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-medium col-span-2">{property.notes}</div>

              <Info label="Tipologia edificio" value={bt?.name} />
              <Info label="Destinazione uso" value={ud?.name} />
              <Info label="Anno costruzione" value={property.yearBuilt} />
              <Info label="Anno ristrutturazione" value={property.renovationYear} />
              <Info label="Piani totali" value={property.floors} />
              <Info label="Unità totali" value={property.totalUnits} />
              <Info label="Piano" value={property.floorNumber} />
            </CardContent>
          </Card>

          {/* SUPERFICI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Superfici
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">

              <Info label="Superficie" value={formatMq(property.sup)} />
              <Info label="Sup. commerciale" value={formatMq(property.supCommercial)} />
              <Info label="Sup. terreno" value={formatMq(property.supLand)} />
              <Info label="Volume" value={property.volume && `${property.volume} m³`} />
            </CardContent>
          </Card>

          {/* STATO */}
          <Card>
            <CardHeader>
              <CardTitle>Stato immobile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              {property.hasElevator && <Badge>Ascensore</Badge>}
              {property.hasGarage && <Badge>Garage</Badge>}
              {property.hasParking && <Badge>Posto auto</Badge>}
              {property.hasGarden && <Badge>Giardino</Badge>}
              {property.hasBalcony && <Badge>Balcone</Badge>}
              {property.hasTerrace && <Badge>Terrazzo</Badge>}
              {property.isHistoricalBuilding && <Badge variant="secondary">Edificio storico</Badge>}
            </CardContent>
          </Card>
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6">

          {/* ENERGIA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Prestazioni energetiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
          
              <EnergyClassBadge value={property.energyClass} />
              <Info label="Destinazione d'uso D.P.R. 412/93" value={eu?.name} />
              <Separator />
              <Info label="EPgl,nren" value={property.EPglnren && `${property.EPglnren} kWh/m²`} />
              <Info label="EPgl,ren" value={property.EPglren && `${property.EPglren} kWh/m²`} />
              <Info label="CO₂" value={property.co2 && `${property.co2} kg/m²`} />
            </CardContent>
          </Card>

          {/* CATASTO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dati catastali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.cadastralData.map((item, index) => (
                <div
                  key={index}
                  className="p-2 rounded-md border text-xs space-y-1"
                >
                  <div className="font-medium">
                    {item.municipality} ({item.municipalityCode})
                  </div>
                  <div>  {getCadastralCategory(item.category)?.name}</div>
                  <div className="flex flex-wrap gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline">Cat. {getCadastralCategory(item.category)?.code}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getCadastralCategory(item.category)?.name}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Badge variant="outline">Foglio {item.sheet}</Badge>
                    <Badge variant="outline">Part. {item.parcel}</Badge>
                    {item.subaltern && (
                      <Badge variant="outline">Sub. {item.subaltern}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PROPRIETARIO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Proprietario
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="font-medium">
                {property.owner.firstName} {property.owner.lastName}
              </div>
              {property.createdAt && (
                <div className="text-muted-foreground text-xs">
                  Inserito il {dayjs(property.createdAt).format("DD/MM/YYYY")}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}