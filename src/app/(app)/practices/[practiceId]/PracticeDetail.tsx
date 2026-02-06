import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Practice } from "@/types/practices";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge";
import { getCadastralCategory } from '@/data/properties';
import { ClientCard } from "@/components/clients/clientCard"

interface PracticeDashboardProps {
  practice: Practice;
}

export default function PracticeDashboard({ practice }: PracticeDashboardProps) {
  const isCTPractice = practice.type === "CONTO_TERMICO";

  return (
    <div className="space-y-6 p-6">

      {/* ---------------- Dati di base ---------------- */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Dati di base</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <p>{practice.name}</p>
          </div>
          <div>
            <Label>Descrizione</Label>
            <p>{practice.description || "-"}</p>
          </div>
          <div>
            <Label>Tipo</Label>
            <p>{practice.type.replaceAll("_", " ")}</p>
          </div>
          <div>
            <Label>Status</Label>
            <p>{practice.status}</p>
          </div>
          <div>
            <Label>Importo</Label>
            <p>{practice.amount?.toLocaleString()} €</p>
          </div>
          <div>
            <Label>Start Date</Label>
            <p>{practice.startDate ? new Date(practice.startDate).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <Label>End Date</Label>
            <p>{practice.endDate ? new Date(practice.endDate).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      </Card>

      {/* ---------------- CT Practice ---------------- */}
      {isCTPractice && practice.ctPractice && (
        <Card className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">CT Practice</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Codice pratica</Label>
              <p>{practice.ctPractice.practiceCode || "-"}</p>
            </div>
            <div>
              <Label>Status CT</Label>
              <p>{practice.ctPractice.status}</p>
            </div>
            <div>
              <Label>Data invio</Label>
              <p>{practice.ctPractice.submittedAt ? new Date(practice.ctPractice.submittedAt).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <Label>Data approvazione</Label>
              <p>{practice.ctPractice.approvedAt ? new Date(practice.ctPractice.approvedAt).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <Label>Data valore</Label>
              <p>{practice.ctPractice.valueDate ? new Date(practice.ctPractice.valueDate).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <Label>Incentivo</Label>
              <p>{practice.ctPractice.incentiveAmount?.toLocaleString()} €</p>
            </div>
            <div>
              <Label>IBAN</Label>
              <p>{practice.ctPractice.iban}</p>
            </div>
            <div>
              <Label>Mandatario</Label>
              <p>{practice.ctPractice.mandatarySubjectId || "-"}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ---------------- Soggetto ---------------- */}

      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Soggetto</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <p>{practice.subject.companyName}</p>
          </div>
          <div>
            <Label>Codice fiscale</Label>
            <p>{practice.subject.id}</p>
          </div>
        </div>
      </Card>


      {/* ---------------- Contributors ---------------- */}
      {practice.contributors?.length > 0 && (
        <Card className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Contributors</h2>
          <div className="grid grid-cols-2 gap-4">
            {practice.contributors.map((c) => (
              <React.Fragment key={c.client.id}>
                <div className="flex items-start">
                 
                 <ClientCard client={c.client} role={c.role || "-"}/>
                </div>
              
              </React.Fragment>
            ))}
          </div>
        </Card>
      )}

      {/* ---------------- Property ---------------- */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Immobile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Indirizzo</Label>
            <p>{practice.property ? practice.property.address : "-"}</p>
          </div>
          <div >
            <Label>Città</Label>
            <p>{practice.property ? practice.property.city : "-"}</p>
          </div>

        </div>
        <div className="gap-4 space-y-1">

          <Label>Dati catastali</Label>
          {practice.property.cadastralData.map((item, index) => (
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
        </div>
      </Card>

      {/* ---------------- Timeline / Date ---------------- */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Creazione</Label>
            <p>{practice.createdAt ? new Date(practice.createdAt).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <Label>Ultimo aggiornamento</Label>
            <p>{practice.updatedAt ? new Date(practice.updatedAt).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      </Card>

    </div>
  );
}