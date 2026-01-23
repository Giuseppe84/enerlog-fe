import { z } from 'zod';
import CodiceFiscale from 'codice-fiscale-js';


// Schema con validazione condizionale
export const clientSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform(v => (v === "" ? undefined : v)),

  type: z.enum(["PHYSICAL", "LEGAL"]),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),

  taxCode: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true; // ← IMPORTANTISSIMO
      try {
        return new CodiceFiscale(val).isValid();
      } catch {
        return false;
      }
    }, { message: "Codice fiscale non valido" }),

  vatNumber: z.string().optional(),

  email: z.string().email("Email non valida"),
  phone: z.string().optional(),

  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),

  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  birthProvince: z.string().optional(),
  gender: z.string().optional(),
  legalAddress: z.string().optional(),

  legalCivicNumber: z.string().optional(),
  legalPostalCode: z.string().optional(),
  legalCity: z.string().optional(),
  legalProvince: z.string().optional(),
  legalCountry: z.string().optional(),
  reaNumber: z.string().optional(),
  chamberCode: z.string().optional(),
  sdiCode: z.string().optional(),
  pecEmail: z.string().optional(),
  legalForm: z.string().optional(),

})
  .superRefine((data, ctx) => {

    /* ===========================
       PERSONA FISICA
       =========================== */
    if (data.type === "PHYSICAL") {
      if (!data.firstName?.trim()) {
        ctx.addIssue({
          path: ["firstName"],
          message: "Nome obbligatorio",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.lastName?.trim()) {
        ctx.addIssue({
          path: ["lastName"],
          message: "Cognome obbligatorio",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.taxCode?.trim()) {
        ctx.addIssue({
          path: ["taxCode"],
          message: "Codice fiscale obbligatorio",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* ===========================
       PERSONA GIURIDICA
       =========================== */
    if (data.type === "LEGAL") {
      if (!data.firstName?.trim()) {
        ctx.addIssue({
          path: ["firstName"],
          message: "Nome obbligatorio",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.lastName?.trim()) {
        ctx.addIssue({
          path: ["lastName"],
          message: "Cognome obbligatorio",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          path: ["companyName"],
          message: "Ragione sociale obbligatoria",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.vatNumber?.trim()) {
        ctx.addIssue({
          path: ["vatNumber"],
          message: "Partita IVA obbligatoria",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });