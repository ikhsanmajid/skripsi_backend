import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from 'fs';
import { HttpError } from "./error";

const storage = multer.diskStorage({
    destination(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const uploadDir = './face_image_dir'

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {
                recursive: true
            })
        }

        cb(null, uploadDir)
    },

    filename(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const name = req.body.name
        const emp_number = req.body.emp_number
        const now = new Date()
        const datetimeStamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            '_' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');

        const fileExtension = path.extname(file.originalname)
        const newName = `${emp_number}_${name}_${datetimeStamp}${fileExtension}`

        if (!name || !emp_number) {
            cb(new Error("Nama dan nik harus diinput"), newName)
        } else {
            cb(null, newName)
        }
    },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error("File tidak diizinkan. Hanya JPG/PNG"))
    }
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})