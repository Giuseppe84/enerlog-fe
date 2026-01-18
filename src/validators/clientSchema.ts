import * as Yup from "yup";

export const clientSchema = Yup.object().shape({
  id: Yup.string().uuid().optional(),

  taxCode: Yup.string()
    .required("Codice fiscale / Tax ID richiesto"),

  vatNumber: Yup.string()
    .nullable()
    .optional(),

  firstName: Yup.string()
    .required("Nome richiesto"),

  lastName: Yup.string()
    .required("Cognome richiesto"),

  email: Yup.string()
    .email("Email non valida")
    .required("Email richiesta"),

  phone: Yup.string()
    .nullable()
    .optional(),

  address: Yup.string()
    .nullable()
    .optional(),

  city: Yup.string()
    .nullable()
    .optional(),

  province: Yup.string()
    .nullable()
    .optional(),

  zip: Yup.string()
    .nullable()
    .optional(),

  country: Yup.string()
    .nullable()
    .optional(),

  primaryColor: Yup.string()
    .nullable()
    .optional(),

  secondaryColor: Yup.string()
    .nullable()
    .optional(),

  avatar: Yup.string()
    .url("URL avatar non valido")
    .nullable()
    .optional(),
});