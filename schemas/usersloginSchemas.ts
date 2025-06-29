import { z } from "zod";

export const registerUserSchema = z.object({
    username: z.string().min(8, "Username minimal 8 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter")
})

export type RegisterUserBody = z.infer<typeof registerUserSchema>;