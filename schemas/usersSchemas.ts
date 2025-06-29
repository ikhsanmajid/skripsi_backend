import { z } from "zod";

export const singleFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().startsWith('image/', 'Only image files are allowed.'),
  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB.'),
});

export const userCreateSchema = z.object({
  name: z.string().min(1, "Nama Wajib Diisi"),
  emp_number: z.string().min(1, "NIK wajib diisi"),
  image: singleFileSchema.optional()
})

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Nama Wajib Diisi"),
  emp_number: z.string().min(1, "NIK wajib diisi"),
  image: singleFileSchema.optional(),
  is_active: z.enum(['true','false'], {
    message: "Status dibutuhkan"
  })
})

export type CreateUserBody = z.infer<typeof userCreateSchema>;
export type UpdateUserBody = z.infer<typeof userUpdateSchema>;
