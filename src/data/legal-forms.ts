export type PersonType = "PHYSICAL" | "LEGAL";
export const LEGAL_FORMS = [
  { value: "SRL", label: "Società a responsabilità limitata (SRL)" },
  { value: "SRLS", label: "Società a responsabilità limitata semplificata (SRLS)" },
  { value: "SPA", label: "Società per azioni (SPA)" },
  { value: "SNC", label: "Società in nome collettivo (SNC)" },
  { value: "SAS", label: "Società in accomandita semplice (SAS)" },
  { value: "DITTA_INDIVIDUALE", label: "Ditta individuale" },
  { value: "COOPERATIVA", label: "Società cooperativa" },
  { value: "ASSOCIAZIONE", label: "Associazione" },
  { value: "FONDAZIONE", label: "Fondazione" },
];