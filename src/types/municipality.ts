

import type { Property } from "./property";
// Tipo per ClimateZone, da adattare se è un enum Prisma
export type ClimateZone = "A" | "B" | "C" | "D" | "E" | "F";

export interface Municipality {
  istatCode: string;            // @id
  name: string;
  normalizedName: string;
  provinceCode: string;
  provinceName?: string | null;
  region?: string | null;
  municipalityCode?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  location?: unknown; // Unsupported("geometry")

  heatingDegreeDays: number;
  climateZone: ClimateZone;
  altitude?: number | null;

  postalCodes: PostalCode[];     // relazione 1:N
  properties: Property[];        // relazione 1:N

  createdAt: Date;
  updatedAt: Date;
}

export interface PostalCode {
  id: number;
  cap: string;

  istatCode: string;
  municipality: Municipality;   // relazione N:1

  createdAt: Date;
}