import { Request, Response, NextFunction } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';
import { HttpError } from './error';

declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}

const TOKEN_SECRET = process.env.TOKEN_SECRET;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return next(new HttpError("Token Dibutuhkan", 400))
    }

    if (!TOKEN_SECRET) {
        console.error("TOKEN_SECRET is not defined in environment variables.");
        return next(new HttpError("Konfigurasi Server Error", 500))
    }

    jsonwebtoken.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err.message);
            return next(new HttpError("Verifikasi Token Gagal / Expired", 401))
        }

        req.user = user;
        //console.log("Authenticated user:", req.user);

        next();
    });
};