import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    winston.format.errors({ stack: true }), 
    winston.format.splat(), 
    winston.format.json() 

);

// Konfigurasi logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', 
    format: logFormat,
    defaultMeta: { service: 'user-api' }, 
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'), 
            level: 'error', 
            maxsize: 5 * 1024 * 1024,
            maxFiles: 10 
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/info.log'), 
            level: 'info', 
            maxsize: 5 * 1024 * 1024, 
            maxFiles: 10 
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/warn.log'), 
            level: 'warn',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 10 
        }),

        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'), 
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 20
        })
    ],

    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/exceptions.log') })
    ],

    rejectionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/rejections.log') })
    ]
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

export default logger;