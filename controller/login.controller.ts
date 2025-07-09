import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../types/types";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import * as bcrypt from "bcrypt"
import * as jsonwebtoken from "jsonwebtoken";
import loginService from "../services/login.service";
import { HttpError } from "../middleware/error";

interface ILoginController {
    login: expressHandler
}


async function generateAccessToken(userinfo: any): Promise<{ token: string, expires_at: Date }> {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined in environment variables.");
    }
    const expiresInSeconds = Number(process.env.TOKEN_EXPIRATION!) * 60 * 60
    const access_token = await jsonwebtoken.sign(userinfo, process.env.TOKEN_SECRET, { expiresIn: expiresInSeconds });
    const expires_at = new Date(Date.now() + expiresInSeconds * 1000);

    return { token: access_token, expires_at };
}

const local = new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
    try {
        const loginResult = await loginService.findUsername(username);

        if (!loginResult || !('data' in loginResult) || loginResult.data === null) {
            return done({ message: "Username Tidak Ada" }, false,);
        }

        const user = loginResult.data;

        if (user.is_active == 0 || user.is_active == false) {
            return done({ message: "User Tidak Aktif" }, false,);
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return done({ message: "Password Salah" }, false,);
        }

        const accessToken = await generateAccessToken({
            username: user.username,
            role: user.role,
            isActive: user.is_active
        });

        return done(null, accessToken, user);
    } catch (e: unknown) {
        console.error("Error in LocalStrategy:", e);
        return done(e);
    }
});

passport.use(local);

async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    passport.authenticate('local', { session: false }, (err: any, tokenInfo: { token: string, expires_at: Date } | false, userinfo: any, info: any) => {
        if (err) {
            console.error("Autentikasi Error:", err);
            if (err.message) {
                return next(new HttpError(err.message, 200))
            }
            return next(err);
        }


        if (!tokenInfo) {
            const message = info && info.message ? info.message : "Autentikasi Gagal";
            return next(new HttpError(message, 200))
        }

        delete userinfo.password

        res.status(200).json({
            status: "success",
            message: "Login Berhasil",
            access_token: tokenInfo.token,
            expires_at: tokenInfo.expires_at,
            user: userinfo
        });

    })(req, res, next);
}

export const loginController: ILoginController = {
    login: loginHandler
};