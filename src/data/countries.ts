export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string;
};

export const COUNTRIES: Country[] = [
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
];