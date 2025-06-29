import { PrismaClientValidationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Request, Response, NextFunction } from "express"

export type ResultModel<T> = { data?: T, count?: number } | { error: PrismaClientKnownRequestError } | { error: PrismaClientValidationError } | null

export type expressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>