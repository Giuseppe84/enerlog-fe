import type { Service } from "@/types/service"
import type { Subject } from "@/types/subject"
import type { Property, CadastralData } from "@/types/property"

/** Pratica in bozza, in attesa di essere inviata con l'ordine. */
export interface PracticeDraft {
  key: string
  subject: Subject
  property: Property
  service: Service
  name: string
  description: string
  type: string
  amount: string
  startDate: string | null
  endDate: string | null
}

const cadastralLabel = (c: CadastralData) =>
  [
    c.sheet && `Fg. ${c.sheet}`,
    c.parcel && `Part. ${c.parcel}`,
    c.subaltern && `Sub. ${c.subaltern}`,
    c.category && `Cat. ${c.category}`,
  ]
    .filter(Boolean)
    .join(" ")

/** Dati catastali dell'immobile; più righe sono unite con " · ". */
export const propertyCadastral = (p?: Property | null) =>
  (p?.cadastralData ?? []).map(cadastralLabel).filter(Boolean).join(" · ")

export const propertyLabel = (p?: Property | null) => {
  if (!p) return "Nessun immobile"
  const address = [p.address, p.city].filter(Boolean).join(", ")
  return address || p.name || "Immobile senza indirizzo"
}
