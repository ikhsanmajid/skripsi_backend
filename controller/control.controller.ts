import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../types/types";
import { detectAndGetDescriptor, euclideanDistance } from "../utils/face-recognition";
import { HttpError } from "../middleware/error";
import controlService from "../services/control.service";

interface IControlController {
    unlockDoor: expressHandler
}


async function unlockDoorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    const data = {
        room_id: req.esp.id,
        rfid: req.body.rfid
    }
    
    console.log(data)

    if (!data.rfid || !data.room_id || !req.file) {
        return next(new HttpError("Data kosong", 400, undefined, { unlock: false }))
    }

    const descriptor = await detectAndGetDescriptor(`./log_camera/${req.file?.filename}`)

    if (descriptor == undefined) {
        return next(new HttpError("Data wajah tidak terdeteksi", 200, undefined, { unlock: false }))
    }

    const searchDataWhiteList = await controlService.checkWhiteListRFID(data.room_id, data.rfid)

    if ("data" in searchDataWhiteList!) {

        if (searchDataWhiteList.data == null) {
            return next(new HttpError("RFID/Room tidak cocok", 200, undefined, { unlock: false }))
        }

        const dataWhiteList = searchDataWhiteList.data

        if(dataWhiteList.is_active_user == false){
            return next(new HttpError("User Tidak Aktif", 200, undefined, { unlock: false }))
        }

        if (dataWhiteList.face_descriptor == null) {
            return next(new HttpError("Data wajah belum direkam", 200, undefined, { unlock: false }))
        }

        const referenceDescriptor = dataWhiteList?.face_descriptor?.split(',')

        //console.log(referenceDescriptor)

        const comparasionImage = await euclideanDistance(referenceDescriptor, descriptor?.descriptor, 0.6)

        let message: string
        let status: string

        if (comparasionImage) {
            status = "success"
            message = `Selamat datang ${dataWhiteList.name} dengan RFID ${dataWhiteList.number} di ${dataWhiteList.room_name}`
        } else {
            status = "error"
            message = `Data wajah tidak cocok`
        }

        res.json({
            status: status,
            message: message,
            unlock: comparasionImage,
            //data: dataWhiteList
        })
    }


}

export const controlController: IControlController = {
    unlockDoor: unlockDoorHandler
};