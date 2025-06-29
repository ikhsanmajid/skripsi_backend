import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from 'fs';

const storage = multer.diskStorage({
    destination(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const uploadDir = './log_camera'

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {
                recursive: true
            })
        }

        cb(null, uploadDir)
    },

    filename(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const rfid = req.body.rfid
        const now = new Date()
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
        const datetimeStamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            '_' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0') +
            '_' +
            milliseconds;

        const fileExtension = path.extname(file.originalname)
        const newName = `${rfid}_${datetimeStamp}${fileExtension}`

        if (!rfid) {
            cb(new Error("RFID harus ada"), newName)
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

export const uploadFromEsp = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})