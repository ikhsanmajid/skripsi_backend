import { Request, Response, NextFunction } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';
import { HttpError } from './error';
import roomsService from '../services/rooms.service';

declare module 'express-serve-static-core' {
    interface Request {
        esp?: any;
    }
}

export const authenticateEsp = async (req: Request, res: Response, next: NextFunction) => {
    const secretHeader = req.headers['secret'];
    const idRoomHeader = req.headers['id-room'];
    const simulatedIpHeader = req.headers['x-simulated-ip'];

    const secret = secretHeader;
    const idRoom = Number(idRoomHeader)
    const simulatedIp = simulatedIpHeader;

    //console.log(secret, idRoom, simulatedIp)

    //req.user = user;
    if (secret == null || idRoom == null || simulatedIp == null) {
        return next(new HttpError("Credentials Dibutuhkan", 400, undefined, { unlock: false }))
    }

    const readRoomById = await roomsService.readByIdRoom(idRoom)

    if (!("data" in readRoomById!)) {
        return next(new HttpError("Backend Error", 500, undefined, { unlock: false }))
    }

    if ("data" in readRoomById!) {
        const dataRoom = readRoomById.data

        if (dataRoom == null) {
            return next(new HttpError("Data credential tidak ditemukan", 404, undefined, { unlock: false }))
        }

        if (dataRoom.secret != secret || dataRoom.id != idRoom || dataRoom.ip_address != simulatedIp) {
            return next(new HttpError("Data credential tidak cocok", 403, undefined, { unlock: false }))
        }

        req.esp = {
            id: idRoom,
            secret: secret,
            ip: simulatedIp
        }

        next();
    }
};