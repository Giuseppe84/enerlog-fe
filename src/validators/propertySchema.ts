import { z } from "zod";

export type PropertyFormValues = z.infer<typeof propertySchema>;
export const locationSchema = z.object({
    municipalityId: z.string().length(6).optional(),
    address: z.string().min(3, "Indirizzo obbligatorio"),
    city: z.string().min(2, "Città obbligatoria"),
    province: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    longitude: z.coerce
        .number()
        .refine(v => !Number.isNaN(v), {
            message: "La longitudine è obbligatoria",
        })
        .refine(v => v !== 0, {
            message: "La longitudine non può essere 0",
        })
        .min(-180, "Longitudine non valida")
        .max(180, "Longitudine non valida"),

    latitude: z.coerce
        .number()
        .refine(v => !Number.isNaN(v), {
            message: "La latitudine è obbligatoria",
        })
        .refine(v => v !== 0, {
            message: "La latitudine non può essere 0",
        })
        .min(-90, "Latitudine non valida")
        .max(90, "Latitudine non valida"),
    municipalityCode: z.string(),
    municipality: z.string(),
});

export const buildingSchema = z.object({
    notes: z.string().optional(),
    name: z.string().optional(),
    yearBuilt: z.coerce.number().int(),
    renovationYear: z.coerce.number().int(),
    propertyType: z.string().optional(),
    hasElevator: z.boolean().optional(),
    hasGarage: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasGarden: z.boolean().optional(),
    hasBalcony: z.boolean().optional(),
    hasTerrace: z.boolean().optional(),
    conditionStatus: z.string().optional(),
    seismicClass: z.string().max(10).optional(),
    isHistoricalBuilding: z.boolean().optional().default(false),
    isHabitable: z.boolean().optional().default(true),
    hasAgibility: z.boolean().optional().default(false),
      heatingType: z.string().optional(),
    coolingType: z.string().optional(),

})
    .superRefine((data, ctx) => {
        const { yearBuilt, renovationYear } = data;

        // valida solo se entrambi sono presenti
        if (
            yearBuilt !== undefined &&
            renovationYear !== undefined &&
            renovationYear <= yearBuilt
        ) {
            ctx.addIssue({
                path: ["renovationYear"], // 👈 errore associato a questo campo
                message: "L’anno di ristrutturazione deve essere successivo all’anno di costruzione",
                code: z.ZodIssueCode.custom,
            });
        }
    });


export const surfaceSchema = z.object({
    sup: z.coerce.number().optional(),
    supCommercial: z.coerce.number().optional(),
    supLand: z.coerce.number().optional(),
    volume: z.coerce.number().optional(),
});

export const energySchema = z.object({
    energyClass: z.string().regex(/^(A[1-4]|[A-G])$/).optional(),
    EPglren: z.number().nonnegative().optional(),
    EPglnren: z.number().nonnegative().optional(),
    co2: z.number().nonnegative().optional(),
  
    energyConsumption: z.number().nonnegative().optional(),
    isNzeb: z.boolean().optional().default(false),


});
export const cadastralSchema = z.object({
    cadastralData: z
        .array(
            z.object({
                municipality: z.string().min(1, "Comune obbligatorio"),
                municipalityCode: z.string().min(1, "Codice comune obbligatorio"),
                category: z.string().min(1, "Categoria obbligatoria"),
                sheet: z.string().min(1, "Foglio obbligatorio"),
                parcel: z.string().min(1, "Particella obbligatoria"),
                subaltern: z.string("Campo obbligatorio")
            })
        )
        .min(1, "Inserisci almeno una particella catastale"),
});

export const ownerSchema = z.object({
    ownerId: z.string().optional(),

});

/** Schema completo */
export const propertySchema = locationSchema
    .merge(buildingSchema)
    .merge(surfaceSchema)
    .merge(energySchema)
    .merge(cadastralSchema)
    .merge(ownerSchema);



