import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpError } from "./error";

export const validateTextOnly = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next()
    } catch (e: unknown) {
        if (e instanceof ZodError) {
            const errorMessages = e.errors.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            return next(new HttpError("Validation failed.", 400, errorMessages));
        }
    }
}

export const validateCreateUser = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataToValidate = {
            ...req.body,
            image: req.file
        }
        schema.parse(dataToValidate);
        next()
    } catch (e: unknown) {
        if (e instanceof ZodError) {
            const errorMessages = e.errors.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            return next(new HttpError("Validation failed.", 400, errorMessages));
        }
    }
}