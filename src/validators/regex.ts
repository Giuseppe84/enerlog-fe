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

export const VAT_NUMBER_REGEX = /^[0-9]{11}$/;

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
