import { z } from "zod";

export const roomCreateSchema = z.object({
  name: z.string().min(1, "Nama ruangan tidak boleh kosong"),
  secret: z.string().min(8, "Password ruangan tidak boleh kosong"),
  ip_address: z.string().ip({version: 'v4', message: "Harus berformat ipv4"}).min(1, "IP tidak boleh kosong")
})

export const roomUpdateSchema = z.object({
    name: z.string().optional(),
    secret: z.string().optional(),
    ip_address: z.string().ip({version: 'v4', message: "Harus berformat ipv4"}).optional()
  })

export type CreateRoomBody = z.infer<typeof roomCreateSchema>;
export type UpdateRoomBody = z.infer<typeof roomUpdateSchema>;
