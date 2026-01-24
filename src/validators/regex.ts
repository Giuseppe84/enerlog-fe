// src/validators/regex.ts

/* =========================
   ANAGRAFICA
========================= */

export const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\s-]{2,50}$/;
export const PROVINCE_REGEX = /^[A-Z]{2}$/;
export const POSTAL_CODE_REGEX = /^[0-9]{5}$/;

/* =========================
   IDENTIFICATIVI ITA
========================= */

export const TAX_CODE_REGEX =
  /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

export const VAT_NUMBER_REGEX = /\b(ATU\d{8}|BE[01]\d{9}|BG\d{9,10}|CY\d{8}[LX]|CZ\d{8,10}|DE\d{9}|DK\d{8}|EE\d{9}|EL\d{9}|ES[\dA-Z]\d{7}[\dA-Z]|FI\d{8}|FR[\dA-Z]{2}\d{9}|HR\d{11}|HU\d{8}|IE\d{7}[A-Z]{2}|IT\d{11}|LT(\d{9}|\d{12})|LU\d{8}|LV\d{11}|MT\d{8}|NL\d{9}B\d{2}|PL\d{10}|PT\d{9}|RO\d{2,10}|SE\d{12}|SI\d{8}|SK\d{10})\b/gm;

/* =========================
   CONTATTI
========================= */

export const PHONE_REGEX = /^\+?[0-9\s]{6,20}$/;

/* =========================
   BANCARI
========================= */

export const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;

export const SWIFT_REGEX =
  /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/* =========================
   AZIENDALI
========================= */

export const SDI_CODE_REGEX = /^[A-Z0-9]{7}$/;


export const PEC_EMAIL_REGEX = /^$|^([^ @]+)@([^ @]+)\.([a-zA-Z]{2,})$/;
