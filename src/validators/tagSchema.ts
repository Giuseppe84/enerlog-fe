import { z } from 'zod';

export const newTagSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-ZÀ-ÿ0-9 ]+$/, "Il nome contiene caratteri non validi"),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Colore HEX non valido")
});



export const syncTagsSchema = z.object({
  tags: z.array(z.string().min(1)).nonempty()
});