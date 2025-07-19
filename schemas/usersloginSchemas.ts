import { z } from "zod";

const role = ["ADMIN", "AUDITOR"] as const
const status = ["true", "false"] as const

export const registerUserSchema = z.object({
    username: z.string().min(8, "Username minimal 8 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.enum(role),
    is_active: z.enum(status)
})

export const updateUserSchema = z.object({
    username: z.string().min(8, "Username minimal 8 karakter"),
    password: z.string().superRefine((password, ctx) => {
        // Jika password == default
        if (password === "default") {
            return z.NEVER
        } else {

            // Jika password < 8 karakter
            if (password.length < 8) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password harus lebih dari 8 karakter",
                })
            }

            // Jika password tidak terdapat angka
            if (!password.match(".*[0-9].*")) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password minimal terdapat 1 angka",
                })
            }

            // Jika password tidak terdapat simbol
            if (!password.match(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password minimal terdapat 1 simbol",
                })
            }

            // Jika password tidak terdapat huruf kapital
            if (!password.match(".*[A-Z].*")) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password minimal terdapat 1 huruf kapital",
                });
            }
        }
    }),
    role: z.enum(role),
    is_active: z.enum(status)
})

export type RegisterUserBody = z.infer<typeof registerUserSchema>;