import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../types/types";
import { detectAndCompareAllDescriptors, detectAndGetDescriptor, euclideanDistance } from "../utils/face-recognition";
import { HttpError } from "../middleware/error";
import { saveRotatedImageToDisk } from "../utils/saveRotatedImageToDisk";
import controlService from "../services/control.service";

interface IControlController {
    unlockDoor: expressHandler
}


// async function unlockDoorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
//     const data = {
//         room_id: req.esp.id,
//         rfid: req.body.rfid
//     }
    
//     console.log(data)

//     if (!data.rfid || !data.room_id || !req.file) {
//         return next(new HttpError("Data kosong", 400, undefined, { unlock: false }))
//     }

//     const descriptor = await detectAndGetDescriptor(`./log_camera/${req.file?.filename}`)

//     if (descriptor == undefined) {
//         return next(new HttpError("Data wajah tidak terdeteksi", 200, undefined, { unlock: false }))
//     }

//     const searchDataWhiteList = await controlService.checkWhiteListRFID(data.room_id, data.rfid)

//     if ("data" in searchDataWhiteList!) {

//         if (searchDataWhiteList.data == null) {
//             return next(new HttpError("RFID/Room tidak cocok", 200, undefined, { unlock: false }))
//         }

//         const dataWhiteList = searchDataWhiteList.data

//         if(dataWhiteList.is_active_user == false){
//             return next(new HttpError("User Tidak Aktif", 200, undefined, { unlock: false }))
//         }

//         if (dataWhiteList.face_descriptor == null) {
//             return next(new HttpError("Data wajah belum direkam", 200, undefined, { unlock: false }))
//         }

//         const referenceDescriptor = dataWhiteList?.face_descriptor?.split(',')

//         //console.log(referenceDescriptor)

//         const comparasionImage = await euclideanDistance(referenceDescriptor, descriptor?.descriptor, 0.6)

//         let message: string
//         let status: string

//         if (comparasionImage) {
//             status = "success"
//             message = `Selamat datang ${dataWhiteList.name} dengan RFID ${dataWhiteList.number} di ${dataWhiteList.room_name}`
//         } else {
//             status = "error"
//             message = `Data wajah tidak cocok`
//         }

//         res.json({
//             status: status,
//             message: message,
//             unlock: comparasionImage,
//             //data: dataWhiteList
//         })
//     }


// }


export async function unlockDoorHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rfid = req.body.rfid;
      const room_id = req.esp?.id;
  
      if (!rfid || !room_id || !req.file) {
        return next(
          new HttpError("Data kosong", 400, undefined, { unlock: false })
        );
      }
  
      // ⬇️ Proses rotate dan simpan manual
      const filename = await saveRotatedImageToDisk(
        req.file.buffer,
        rfid,
        req.file.originalname
      );
  
      //const descriptor = await detectAndGetDescriptor(`./log_camera/${filename}`);
      const descriptor = await detectAndCompareAllDescriptors(`./log_camera/${filename}`);
  
      if (descriptor == undefined) {
        return next(
          new HttpError("Data wajah tidak terdeteksi", 200, undefined, {
            unlock: false,
          })
        );
      }
  
      const searchDataWhiteList = await controlService.checkWhiteListRFID(
        room_id,
        rfid
      );

      console.log("RFID: ", rfid)
  
      if ("data" in searchDataWhiteList! && searchDataWhiteList.data != null) {
        const dataWhiteList = searchDataWhiteList.data;
  
        if (!dataWhiteList.is_active_user) {
          return next(
            new HttpError("User Tidak Aktif", 200, undefined, { unlock: false })
          );
        }

        if (!dataWhiteList.is_active_rfid) {
          return next(
            new HttpError("RFID Tidak Aktif", 200, undefined, { unlock: false })
          );
        }
  
        if (!dataWhiteList.face_descriptor) {
          return next(
            new HttpError("Data wajah belum direkam", 200, undefined, {
              unlock: false,
            })
          );
        }
  
        const referenceDescriptor = dataWhiteList.face_descriptor.split(",");
        const comparasionImage = await euclideanDistance(
          referenceDescriptor,
          descriptor,
          0.6
        );
  
        const status = comparasionImage ? "success" : "error";
        const message = comparasionImage
          ? `Selamat datang ${dataWhiteList.name} dengan RFID ${dataWhiteList.number} di ${dataWhiteList.room_name}`
          : `Data wajah tidak cocok`;

        // async save to db
        const saveAccessLog = controlService.saveToAccessLog(rfid, room_id, filename)
  
        res.json({
          status,
          message,
          unlock: comparasionImage,
        });
      } else {
        return next(
          new HttpError("RFID/Room tidak cocok", 200, undefined, {
            unlock: false,
          })
        );
      }
    } catch (err) {
      console.error(err);
      next(new HttpError("Terjadi kesalahan server", 500));
    }
  }

export const controlController: IControlController = {
    unlockDoor: unlockDoorHandler
};