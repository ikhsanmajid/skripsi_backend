import { Request, Response, NextFunction } from "express";
import multer from "multer";
import logger from "../config/logger";
import { formatInTimeZone } from "date-fns-tz";
import { Prisma } from "@prisma/client";

export interface CustomError extends Error {
    code?: number;
    message: string;
    params?: {
        unlock?: boolean | undefined
    }
    zodErrors?: { path: string | (string | number)[]; message: string }[];
}

export class HttpError extends Error implements CustomError {
    code: number;
    zodErrors?: { path: string | (string | number)[]; message: string }[];
    unlock?: boolean | undefined

    constructor(message: string, code: number = 500, zodErrors?: { path: string | (string | number)[]; message: string }[], params?: { unlock?: boolean | undefined }) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.zodErrors = zodErrors;
        this.unlock = params?.unlock
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export function handleErrorCustom(err: Error | CustomError, req: Request, res: Response, next: NextFunction) {
    let statusCode: number;
    let responseMessage: string;
    let unlockDetail: boolean | undefined = undefined;
    let zodErrorsDetail: { path: string | (string | number)[]; message: string }[] | undefined = undefined;
    statusCode = 500;
    responseMessage = "Terjadi kesalahan server yang tidak terduga.";

    const currentTimeZone = 'Asia/Jakarta';
    const gmtPlus7FormattedString = formatInTimeZone(new Date(), currentTimeZone, "dd-MM-yyyy HH:mm:ss");

    const requestBodyForLog = { ...req.body };
    if (requestBodyForLog.password) {
        delete requestBodyForLog.password;
    }

    const logData = {
        request: {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            body: requestBodyForLog,
            query: req.query,
            params: req.params,
        },
        errorName: err.name,
        errorMessage: err.message,
        stack: err.stack,
        timestamp: gmtPlus7FormattedString,
    };

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            statusCode = 413;
            responseMessage = `Ukuran file terlalu besar. Maksimal ${process.env.MAX_FILE_SIZE_MB || '5'}MB diizinkan.`;
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            statusCode = 413;
            responseMessage = "Jumlah file melebihi batas yang diizinkan.";
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            statusCode = 400;
            responseMessage = `Field file "${err.field}" tidak diizinkan atau tidak sesuai.`;
        } else {
            statusCode = 400;
            responseMessage = `Kesalahan upload: ${err.message}`;
        }
    }

    else if (err instanceof HttpError) {
        statusCode = err.code;
        responseMessage = err.message;
        zodErrorsDetail = err.zodErrors;
        unlockDetail = err.unlock;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;
        const messageLines = err.message.split('\n');
        responseMessage = `Database error: ${messageLines[messageLines.length - 1]}`;
        Object.assign(logData, {
            prismaErrorCode: err.code,
            prismaMeta: err.meta,
            prismaClientVersion: err.clientVersion,
        });


        if (err.code === 'P2002') {
            statusCode = 409;
            responseMessage = `Data duplikat terdeteksi: ${JSON.stringify(err.meta?.target || 'unknown field')}`;
        } else if (err.code === 'P2025') {
            statusCode = 404;
            responseMessage = `Data tidak ditemukan: ${JSON.stringify(err.meta?.cause || err.message)}`;
        }
    }
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400; // Bad Request
        const messageLines = err.message.split('\n');
        responseMessage = `Query validation error: ${messageLines[messageLines.length - 1]}`;
        Object.assign(logData, {
            prismaErrorType: 'ValidationError',
            prismaClientVersion: err.clientVersion,
        });
    }

    else if (err instanceof Error) {
        responseMessage = err.message;
    }


    if (statusCode >= 500) {
        logger.error(`[${statusCode}] Server Error: ${responseMessage}`, logData);
    } else if (statusCode >= 400 && statusCode < 500) {
        logger.warn(`[${statusCode}] Client Error: ${responseMessage}`, logData);
    }

    res.status(statusCode).json({
        status: "error",
        message: responseMessage,
        unlock: unlockDetail,
        zodErrors: zodErrorsDetail
    });
}