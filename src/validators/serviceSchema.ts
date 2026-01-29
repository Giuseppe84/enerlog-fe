import { z } from "zod";
import { it } from "zod/locales"
import { newTagSchema } from "./tagSchema";
/**
 * Base fields shared between create & update
 */
z.config(it());


const baseServiceSchema = {
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Formato non valido"),

  name: z
    .string()
    .trim()
    .min(3)
    .max(100),
  notes: z
    .string()
    .trim()
    .min(3)
    .max(800)
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(800)
    .optional()
    .nullable(),

  category: z
    .string("Campo obbligatorio")
    .trim()
    .min(3, "Category is required")
    .max(50),

  price: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Price must be a positive number",
    }),

  isActive: z.boolean().optional(),

  url: z
    .string()
    .url("Invalid URL")
    .optional()
    .nullable(),

  image: z
    .string()
    .optional()
    .nullable(),
  icon: z
    .string()
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid HEX color")
    .optional()
    .nullable(),
};

const existingTagSchema = z.object({
  id: z.number().int().positive()
});

/**
 * Create Service
 */
export const createServiceSchema = z.object({
  ...baseServiceSchema,
});

/**
 * Update Service (PATCH / PUT)
 */
export const updateServiceSchema = z.object({
  name: baseServiceSchema.name,
    code: baseServiceSchema.code,
   notes: baseServiceSchema.notes.optional(),
  description: baseServiceSchema.description,
  category: baseServiceSchema.category,
  price: baseServiceSchema.price,
  isActive: baseServiceSchema.isActive.optional(),
  url: baseServiceSchema.url.optional(),
  image: baseServiceSchema.image.optional(),
  color: baseServiceSchema.color.optional(),
    tags: z.array(z.union([existingTagSchema, newTagSchema])).optional(),
});

/**
 * Params validator
 */
export const serviceIdSchema = z.object({
  id: z.string().uuid("Invalid service id"),
});

/**
 * Types
 */
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;