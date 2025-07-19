import { Prisma, PrismaClient, Rooms } from "@prisma/client";
import { ResultModel } from "../types/types";

type resultCheckWhiteList = {
    number?: string;
    is_active_rfid?: boolean;
    name?: string;
    room_name?: string;
    face_descriptor?: string | null;
    is_active_user?: boolean;
}

interface IControlService {
    checkWhiteListRFID: (room_id: number, rfid: string) => Promise<ResultModel<resultCheckWhiteList | null>>
}

const prisma = new PrismaClient();

async function checkWhiteListRFIDHandler(room_id: number, rfid: string) {
    let result: resultCheckWhiteList

    const checkWhiteList = await prisma.usersRFIDCardRoom.findFirst({
        select: {
            userRFIDFK: {
                select: {
                    rfidIDFK: {
                        select: {
                            number: true,
                            is_active: true
                        }
                    },
                    userIDFK: {
                        select: {
                            name: true,
                            face_descriptor: true,
                            is_active: true
                        }
                    }
                }
            },
            roomIDFK: {
                select: {
                    name: true,
                }
            }
        },
        where: {
            userRFIDFK: {
                rfidIDFK: {
                    number: rfid
                },
            },
            roomIDFK: {
                id: room_id
            }
          
        }
    })

    result = {
        number: checkWhiteList?.userRFIDFK.rfidIDFK.number,
        is_active_rfid: checkWhiteList?.userRFIDFK.rfidIDFK.is_active,
        name: checkWhiteList?.userRFIDFK.userIDFK.name,
        room_name: checkWhiteList?.roomIDFK.name,
        face_descriptor: checkWhiteList?.userRFIDFK.userIDFK.face_descriptor,
        is_active_user: checkWhiteList?.userRFIDFK.userIDFK.is_active
    }

    //console.log(checkWhiteList)

    return {
        data: checkWhiteList == null ? null : result
    }
}

const controlService: IControlService = {
    checkWhiteListRFID: checkWhiteListRFIDHandler
}

export default controlService