import { z } from "zod";
import { PEC_EMAIL_REGEX, IBAN_REGEX, SWIFT_REGEX, TAX_CODE_REGEX, VAT_NUMBER_REGEX, SDI_CODE_REGEX } from "./regex";

export const SubjectFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["PHYSICAL", "LEGAL"]),
  clientId: z.string().uuid().optional().nullable(),
  // PHYSICAL
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  taxCode: z.string().regex(TAX_CODE_REGEX, "Formato codice fiscale non valido").nullable(),
  birthDate: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  birthProvince: z.string().optional().nullable(),
  gender: z.enum(["M", "F"]).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  // LEGAL
  companyName: z.string().optional().nullable(),
  vatNumber: z.string().regex(VAT_NUMBER_REGEX, "Formato partita IVA non valido").optional().nullable(),
  legalForm: z.string().optional().nullable(),
  reaNumber: z.string().optional().nullable(),
  sdiCode: z.string().regex(SDI_CODE_REGEX, "Formato email SDI non valido").optional().nullable(),
  pecEmail: z.string().regex(PEC_EMAIL_REGEX, "Formato email PEC non valido").optional().nullable(),

  // CONTATTI COMUNI
  email: z.string().email().nullable(),
  phone: z.string().optional().nullable(),

  // SEDE LEGALE
  legalAddress: z.string().optional().nullable(),
  legalCity: z.string().optional().nullable(),
  legalProvince: z.string().optional().nullable(),
  legalPostalCode: z.string().optional().nullable(),
  legalCountry: z.string().optional().nullable(),

  // BANCA
  iban: z.string().regex(IBAN_REGEX, "Formato IBAN non valido").optional().nullable(),
  swift: z.string().regex(SWIFT_REGEX, "Formato SWIFT non valido").optional().nullable(),
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