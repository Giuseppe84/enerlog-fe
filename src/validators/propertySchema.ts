import { z } from "zod";

export const locationSchema = z.object({
  address: z.string().min(3, "Indirizzo obbligatorio"),
  city: z.string().min(2, "Città obbligatoria"),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().default("IT"),
});

export const buildingSchema = z.object({
  yearBuilt: z.number().int().optional(),
  renovationYear: z.number().int().optional(),
  hasElevator: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
});

export const surfaceSchema = z.object({
  sup: z.number().optional(),
  supCommercial: z.number().optional(),
  supLand: z.number().optional(),
  volume: z.number().optional(),
});

export const energySchema = z.object({
  energyClass: z.string().optional(),
  EPglren: z.number().optional(),
  EPglnren: z.number().optional(),
  co2: z.number().optional(),
});

export const cadastralSchema = z.object({
  cadastralData: z.array(
    z.object({
      municipality: z.string(),
      municipalityCode: z.string(),
      category: z.string(),
      sheet: z.string(),
      parcel: z.string(),
      subaltern: z.string().optional().nullable(),
    })
  ),
});

export const ownerSchema = z.object({
  ownerId: z.string().uuid(),
  notes: z.string().optional(),
});

/** Schema completo */
export const propertySchema = locationSchema
  .merge(buildingSchema)
  .merge(surfaceSchema)
  .merge(energySchema)
  .merge(cadastralSchema)
  .merge(ownerSchema);

export type PropertyFormValues = z.infer<typeof propertySchema>;