import * as Yup from 'yup';
import CodiceFiscale from 'codice-fiscale-js';
import { fi } from 'date-fns/locale';
import { emptyToNull, firsUpper, toUpper, trim, isBirthDateMatchingTaxCode,isValidVatIT,isValidIBAN,isValidItalianZip } from './common';



/** Base schema */
const BaseSubjectSchema = {
  firstName: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  lastName: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  taxCode: Yup.string()
    .transform(trim)
    .transform(toUpper)
    .required('Codice fiscale obbligatorio')
    .length(16, 'Il codice fiscale deve avere 16 caratteri')
    .test('valid-tax-code', 'Codice fiscale non valido', value => {
      if (!value) return false;
      try {
        new CodiceFiscale(value);
        return true;
      } catch {
        return false;
      }
    }),
  email: Yup.string().transform(trim).email('Email non valida').required('Email obbligatoria'),
  phone: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  mobile: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  birthDate: Yup.string().transform(emptyToNull).nullable(),
  birthPlace: Yup.string().transform(trim).transform(toUpper).transform(emptyToNull).nullable(),
  birthProvince: Yup.string().transform(trim).length(2, 'Il codice fiscale deve avere 2 caratteri').transform(toUpper).transform(emptyToNull).nullable(),
  address: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  city: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  province: Yup.string().transform(trim).transform(toUpper).transform(emptyToNull).nullable(),
  zip: Yup.string().transform(trim).transform(emptyToNull).test('valid-zip', 'CAP non valido', isValidItalianZip).nullable(),
  country: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  iban: Yup.string().transform(trim).transform(toUpper).transform(emptyToNull).test('valid-iban', 'IBAN non valido', isValidIBAN).nullable(),
  swift: Yup.string().transform(trim).transform(toUpper).transform(emptyToNull).nullable(),
  pecEmail: Yup.string().transform(trim).email('PEC non valida').transform(emptyToNull).nullable(),
  sdiCode: Yup.string().transform(trim).transform(emptyToNull).nullable(),
  gender: Yup.string().oneOf(['M', 'F', 'X']).transform(toUpper).transform(emptyToNull).nullable(),
};

/** Physical schema */
export const PhysicalSubjectSchema = Yup.object({
  type: Yup.string().oneOf(['PHYSICAL']).required(),
  ...BaseSubjectSchema,
  firstName: Yup.string().transform(trim).required('Nome obbligatorio'),
  lastName: Yup.string().transform(trim).required('Cognome obbligatorio'),
  vatNumber: Yup.mixed().transform(() => null).nullable(),
  companyName: Yup.mixed().transform(() => null).nullable(),
  legalForm: Yup.mixed().transform(() => null).nullable(),
  reaNumbrer: Yup.mixed().transform(() => null).nullable(),
  chamberCode: Yup.mixed().transform(() => null).nullable(),
}).test(
  'birthdate-taxcode-match',
  'La data di nascita non è coerente con il codice fiscale',
  value => isBirthDateMatchingTaxCode(value?.birthDate, value?.taxCode)
);

/** Legal schema */
export const LegalSubjectSchema = Yup.object({
  type: Yup.string().oneOf(['LEGAL']).required(),
  ...BaseSubjectSchema,
  firstName: Yup.mixed().transform(() => null),
  lastName: Yup.mixed().transform(() => null),
  vatNumber: Yup.string().transform(trim).required('Partita IVA obbligatoria').test('valid-vat', 'Partita IVA non valida', isValidVatIT),
  companyName: Yup.string().transform(trim).required('Ragione sociale obbligatoria'),
});

/** Lazy schema dinamico per Formik */
export const SubjectSchema = Yup.lazy((values: any) =>
  values?.type === 'LEGAL' ? LegalSubjectSchema : PhysicalSubjectSchema
);