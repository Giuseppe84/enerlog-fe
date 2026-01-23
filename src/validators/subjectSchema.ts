import { z } from "zod";

export const SubjectFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["PHYSICAL", "LEGAL"]),

  // PHYSICAL
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  taxCode: z.string().nullable(),
  birthDate: z.string().nullable(),
  birthPlace: z.string().nullable(),
  birthProvince: z.string().nullable(),
  gender: z.enum(["M", "F"]).nullable(),

  // LEGAL
  companyName: z.string().nullable(),
  vatNumber: z.string().nullable(),
  legalForm: z.string().nullable(),
  reaNumber: z.string().nullable(),
  sdiCode: z.string().nullable(),
  pecEmail: z.string().email().nullable(),

  // CONTATTI COMUNI
  email: z.string().email().nullable(),
  phone: z.string().nullable(),

  // SEDE LEGALE
  legalAddress: z.string().nullable(),
  legalCity: z.string().nullable(),
  legalProvince: z.string().nullable(),
  legalPostalCode: z.string().nullable(),
  legalCountry: z.string().nullable(),

  // BANCA
  iban: z.string().nullable(),
  swift: z.string().nullable(),
})
.superRefine((values, ctx) => {
  if (values.type === "PHYSICAL") {
    if (!values.firstName)
      ctx.addIssue({ path: ["firstName"], message: "Nome obbligatorio", code: "custom" });
    if (!values.lastName)
      ctx.addIssue({ path: ["lastName"], message: "Cognome obbligatorio", code: "custom" });
    if (!values.taxCode)
      ctx.addIssue({ path: ["taxCode"], message: "Codice fiscale obbligatorio", code: "custom" });
    if (!values.birthDate)
      ctx.addIssue({ path: ["birthDate"], message: "Data di nascita obbligatoria", code: "custom" });
    if (!values.birthPlace)
      ctx.addIssue({ path: ["birthPlace"], message: "Luogo di nascita obbligatorio", code: "custom" });
  }

  if (values.type === "LEGAL") {
    if (!values.companyName)
      ctx.addIssue({ path: ["companyName"], message: "Ragione sociale obbligatoria", code: "custom" });
    if (!values.vatNumber)
      ctx.addIssue({ path: ["vatNumber"], message: "Partita IVA obbligatoria", code: "custom" });
    if (!values.legalForm)
      ctx.addIssue({ path: ["legalForm"], message: "Forma giuridica obbligatoria", code: "custom" });
    if (!values.legalAddress)
      ctx.addIssue({ path: ["legalAddress"], message: "Indirizzo legale obbligatorio", code: "custom" });
    if (!values.legalCity)
      ctx.addIssue({ path: ["legalCity"], message: "Città legale obbligatoria", code: "custom" });
    if (!values.legalProvince)
      ctx.addIssue({ path: ["legalProvince"], message: "Provincia legale obbligatoria", code: "custom" });
    if (!values.legalPostalCode)
      ctx.addIssue({ path: ["legalPostalCode"], message: "CAP obbligatorio", code: "custom" });
    if (!values.pecEmail)
      ctx.addIssue({ path: ["pecEmail"], message: "PEC obbligatoria", code: "custom" });
  }
});