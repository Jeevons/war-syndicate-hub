import { z } from "zod"

export const applicationSchema = z.object({
  discordTag: z.string().min(1, "Discord tag requis"),
  cocTag: z
    .string()
    .regex(/^#[A-Z0-9]{4,9}$/i, "Format invalide — exemple : #ABC12345"),
  hotelDeVille: z.coerce
    .number()
    .int()
    .min(1, "Minimum HDV 1")
    .max(17, "Maximum HDV 17"),
  message: z.string().max(500, "Maximum 500 caractères").optional(),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>
