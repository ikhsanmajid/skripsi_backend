import { z } from "zod";

export const singleFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().startsWith('image/', 'Only image files are allowed.'),
  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB.'),
});

export const controlCheckSchema = z.object({
  rfid: z.string().min(1, "RFID wajib discan"),
  image: singleFileSchema
})

export type ControlCheckBody = z.infer<typeof controlCheckSchema>;
