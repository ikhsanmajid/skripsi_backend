import { number, z } from "zod";

export const rfidCreateSchema = z.object({
  number: z.string().min(8, "Nomor kartu RFID minimal 8 karakter").max(8, "Nomor kartu RFID maksimal 8 karakter")
})

export const rfidUpdateSchema = z.object({
    number: z.string().min(8, "Nomor kartu RFID minimal 8 karakter").max(8, "Nomor kartu RFID maksimal 8 karakter").optional(),
    is_active: z.enum(["true", "false"]).optional()
  })

export type CreateRFIDBody = z.infer<typeof rfidCreateSchema>;
export type UpdateRFIDBody = z.infer<typeof rfidUpdateSchema>;
