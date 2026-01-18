import CodiceFiscale from 'codice-fiscale-js';

/** "" → null */
export const emptyToNull = (_: any, originalValue: any) =>
  originalValue === '' ? null : originalValue;

/** trim string */
export const trim = (value: any) =>
  typeof value === 'string' ? value.trim() : value;

/** uppercase */
export const toUpper = (value: any) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export const firsUpper = (value: any) =>
  typeof value === 'string'
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : value;

export const isValidVatIT = (vat?: string | null) => {
  if (!vat) return true;
  if (!/^\d{11}$/.test(vat)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let n = Number(vat[i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }

  const check = (10 - (sum % 10)) % 10;
  return check === Number(vat[10]);
};

export const isValidIBAN = (iban?: string | null) => {
  if (!iban) return true;

  const ibanClean = iban.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9]+$/.test(ibanClean)) return false;

  const rearranged = ibanClean.slice(4) + ibanClean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, ch =>
    (ch.charCodeAt(0) - 55).toString()
  );

  let remainder = numeric;
  let mod = 0;
  while (remainder.length > 0) {
    const block = mod + remainder.slice(0, 9);
    remainder = remainder.slice(9);
    mod = Number(block) % 97;
  }

  return mod === 1;
};

export const isValidItalianZip = (zip?: string | null) => {
  if (!zip) return true;
  if (!/^\d{5}$/.test(zip)) return false;

  const num = Number(zip);
  return num >= 10 && num <= 98168;
};

export const isBirthDateMatchingTaxCode = (
  birthDate?: string | null,
  taxCode?: string | null
) => {
  if (!birthDate || !taxCode) return true;

  try {
    const cf = new CodiceFiscale(taxCode);
    const cfDate = cf.birthday; // Date object

    const inputDate = new Date(birthDate);
    return (
      cfDate.getFullYear() === inputDate.getFullYear() &&
      cfDate.getMonth() === inputDate.getMonth() &&
      cfDate.getDate() === inputDate.getDate()
    );
  } catch {
    return false;
  }
};

