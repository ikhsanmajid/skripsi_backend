import { Request, Response, NextFunction } from "express"
import { HttpError } from "./error"

export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user){
            return next(new HttpError("Authentikasi Dibutuhkan", 401))
        }

        if (allowedRoles.includes(req.user.role)){
            next()
        } else {
            return next(new HttpError("Forbidden", 403))
        }       
    }
}