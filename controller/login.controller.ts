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


async function generateAccessToken(userinfo: any): Promise<string> {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined in environment variables.");
    }
    const access_token = await jsonwebtoken.sign(userinfo, process.env.TOKEN_SECRET, { expiresIn: '2h' });
    return access_token;
}

const local = new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
    try {
        const loginResult = await loginService.findUsername(username);

        if (!loginResult || !('data' in loginResult) || loginResult.data === null) {
            return done(null, false, { message: "Username Tidak Ada" });
        }

        const user = loginResult.data;

        if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: "Password Salah" });
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
    passport.authenticate('local', { session: false }, (err: any, access_token: string | false, userinfo: any, info: any) => {
        if (err) {
            console.error("Autentikasi Error:", err);
            if (err.message) {
                return next(new HttpError("Server Authentikasi Error", 500))
            }
            return next(err);
        }

        if (!access_token) {
            const message = info && info.message ? info.message : "Autentikasi Gagal";
            return next(new HttpError(message, 200))
        }

        delete userinfo.password

        res.status(200).json({
            status: "success",
            message: "Login Berhasil",
            access_token: access_token,
            user: userinfo
        });

    })(req, res, next);
}

export const loginController: ILoginController = {
    login: loginHandler
};