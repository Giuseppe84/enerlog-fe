import { z } from "zod";
export enum PracticeTypesEnum {
  CONTO_TERMICO = "CONTO_TERMICO",
  APE = "APE",
  FV_CONNESSIONE = "FV_CONNESSIONE",
  ENEA = "ENEA",
  L10 = "L10",
  PG_EL = "PG_EL",
  PG_CL = "PG_CL",
  PT_MET = "PT_MET",
  GENERIC = "GENERIC",
}

type CTPracticeStatus = 'DRAFT' | 'READY_TO_SUBMIT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
const CTPracticeStatusArray = [
  'DRAFT',
  'READY_TO_SUBMIT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'PAID',
] as const;
export const CTPracticeSchema = z.object({
  id:z.uuid().optional().nullable(),
  subjectId: z.string().optional(),

  mandatarySubjectId: z.string().optional(),
  propertyId: z.string().optional(),
  clientId: z.string().optional(),
  orderId: z.string().optional(),
  type: z.string().optional(),
  name: z.string().min(1, 'Campo obbligatorio'),
  description: z.string().min(1, 'Campo obbligatorio'),
  status: z.string().min(1, 'Campo obbligatorio'),
  amount:  z.coerce.number().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  approvedAt: z.string().optional().nullable(),
  submittedAt: z.string().optional().nullable(),
  valueDate: z.string().optional().nullable(),
  practiceCode: z.string().min(1, 'Campo obbligatorio'),
  interventionTypeId: z.string().min(1, 'Tipo intervento obbligatorio'),
  serviceId: z.uuid(),

  iban: z.string().nullable().optional(),

incentiveAmount: z.coerce.number().optional(),
  mandateForCollection: z.boolean(),
  CTstatus: z.enum(CTPracticeStatusArray)
})