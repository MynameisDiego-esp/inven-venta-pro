// src/lib/validators.ts
import { z } from "zod";

export const clientSchema = z.object({
  personType: z.enum(["Fisica", "moral"], {
    required_error: "El tipo de persona es obligatorio.",
  }),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  rfc: z.string().min(10, "El RFC no parece válido.").max(13, "El RFC no parece válido."),
  email: z.string().email("El formato del email no es válido."),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos.").optional().or(z.literal('')), // Opcional pero si existe, debe tener 7+ dígitos
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});