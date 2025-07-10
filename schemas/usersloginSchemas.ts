import { z } from "zod";

const role = ["ADMIN", "AUDITOR"] as const
const status = ["true", "false"] as const

export const registerUserSchema = z.object({
    username: z.string().min(8, "Username minimal 8 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.enum(role),
    is_active: z.enum(status)
})

export type RegisterUserBody = z.infer<typeof registerUserSchema>;