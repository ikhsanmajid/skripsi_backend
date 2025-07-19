import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";

interface IRFIDController {

}

async function createRFIDHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        number: String(req.body.number).toUpperCase()
    }

    const createRFID = await rfidService.createRFID(data.number)

    if ("data" in createRFID!) {
        res.json({
            status: "success",
            data: createRFID.data,
            message: "Kartu RFID berhasil ditambahkan"
        })
    }
}


export const rfidController: IRFIDController = {
    
}