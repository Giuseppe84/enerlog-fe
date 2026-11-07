"use client";
import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Order } from "@/types/order"
import type { Client } from "@/types/client"
import { toArray } from "./new/WizardParts";
// ---------------------------------------------------------------------------
// TODO: adatta ai nomi reali delle tue API.
//  - fetchClients(): () => Promise<Client[]>
//  - createOrder(payload): Promise<Order>
//    payload = { clientId, practices: [{ subjectId, propertyId, serviceId,
//      name, description, type, amount, startDate, endDate }] }
//    Consigliato: crea ordine + pratiche in un'unica transazione lato server.
// ---------------------------------------------------------------------------
import { fetchClients } from "@/api/clients"
import { createOrUpdateOrder } from "@/api/orders"

import { WizardSteps, PickList, personLabel, formatEuro } from "./new/WizardParts"
import { PracticeWizardModal, type PracticeDraft } from "./PracticeWizardModal"

const STEPS = ["Cliente", "Pratiche", "Riepilogo"]

export function OrderWizardModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (order: Order) => void
}) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [client, setClient] = useState<Client | null>(null)

  const [drafts, setDrafts] = useState<PracticeDraft[]>([])
  const [practiceOpen, setPracticeOpen] = useState(false)

  const clientLabel = (c: Client) => personLabel(c as any)

  // Reset all'apertura
  useEffect(() => {
    if (!open) return
    setStep(0)
    setSaving(false)
    setError(null)
    setClient(null)
    setDrafts([])
  }, [open])

  // Caricamento clienti
  useEffect(() => {
    if (!open || clients.length > 0) return
    let cancelled = false
    setClientsLoading(true)
    fetchClients()
     .then((data: any) => !cancelled && setClients(toArray<Client>(data)))
      .catch(() => !cancelled && setError("Impossibile caricare i clienti."))
      .finally(() => !cancelled && setClientsLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const total = useMemo(() => drafts.reduce((sum, d) => sum + Number(d.amount || 0), 0), [drafts])

  const next = async () => {
    setError(null)

    if (step === 0) {
      if (!client) return setError("Seleziona un cliente.")
      return setStep(1)
    }

    if (step === 1) {
      if (drafts.length === 0) return setError("Aggiungi almeno una pratica.")
      return setStep(2)
    }

    // step 2: conferma
    setSaving(true)
    try {
      const order = await createOrUpdateOrder({
        clientId: (client as any).id,
        practices: drafts.map((d) => ({
          subjectId: d.subject.id,
          propertyId: d.property.id,
          serviceId: d.service.id,
          name: d.name,
          description: d.description,
          type: d.type,
          amount: d.amount,
          startDate: d.startDate,
          endDate: d.endDate,
        })),
      } as any)
      onCreated?.(order as Order)
      onOpenChange(false)
    } catch {
      setError("Errore nella creazione dell'ordine. Riprova.")
      setSaving(false)
    }
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  const removeDraft = (index: number) => setDrafts((prev) => prev.filter((_, i) => i !== index))

  const isLast = step === STEPS.length - 1

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo ordine</DialogTitle>
            <DialogDescription>
              Passo {step + 1} di {STEPS.length}: {STEPS[step]}
            </DialogDescription>
          </DialogHeader>

          <WizardSteps steps={STEPS} current={step} />

          <div className="min-h-[20rem] space-y-4 pt-2">
            {/* ---- Passo 1: cliente ---- */}
            {step === 0 && (
              <PickList
                items={clients}
                loading={clientsLoading}
                selectedId={(client as any)?.id}
                getId={(c) => (c as any).id}
                getLabel={clientLabel}
                getSubtitle={(c) => (c as any).email || undefined}
                onSelect={setClient}
                placeholder="Cerca un cliente..."
                empty="Nessun cliente trovato."
              />
            )}

            {/* ---- Passo 2: pratiche ---- */}
            {step === 1 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Cliente: <span className="font-medium text-foreground">{client && clientLabel(client)}</span>
                  </p>
                  <Button size="sm" className="gap-2" onClick={() => setPracticeOpen(true)}>
                    <Plus className="h-4 w-4" /> Aggiungi pratica
                  </Button>
                </div>

                {drafts.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                    Nessuna pratica aggiunta.
                    <br />
                    Usa «Aggiungi pratica» per crearne una.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {drafts.map((d, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {personLabel(d.subject)} · {d.property.address || "Immobile"} · {d.service.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold">{formatEuro(d.amount)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Rimuovi ${d.name}`}
                            onClick={() => removeDraft(i)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* ---- Passo 3: riepilogo ---- */}
            {step === 2 && (
              <>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Cliente:</span> {client && clientLabel(client)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Pratiche:</span> {drafts.length}
                  </p>
                </div>
                <ul className="divide-y rounded-lg border">
                  {drafts.map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {personLabel(d.subject)} · {d.service.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm">{formatEuro(d.amount)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step >= 1 && (
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Totale ordine</span>
                <span className="text-lg font-semibold">{formatEuro(total)}</span>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Annulla
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={back} disabled={saving}>
                  Indietro
                </Button>
              )}
              <Button onClick={next} disabled={saving}>
                {saving ? "Creazione..." : isLast ? "Crea ordine" : "Avanti"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PracticeWizardModal
        open={practiceOpen}
        onOpenChange={setPracticeOpen}
        onComplete={(draft) => {
          setDrafts((prev) => [...prev, draft])
          setError(null)
        }}
      />
    </>
  )
}

/* Esempio d'uso:

const [orderOpen, setOrderOpen] = useState(false)
<Button onClick={() => setOrderOpen(true)}>Nuovo ordine</Button>
<OrderWizardModal
  open={orderOpen}
  onOpenChange={setOrderOpen}
  onCreated={(order) => router.push(`/orders/${order.id}`)}
/>
*/
