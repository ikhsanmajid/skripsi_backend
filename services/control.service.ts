import { Prisma, PrismaClient, Rooms } from "@prisma/client";
import { ResultModel } from "../types/types";
import { data } from "@tensorflow/tfjs-node-gpu";

type resultCheckWhiteList = {
    number: string;
    is_active_rfid: boolean;
    name: string;
    room_name: string;
    face_descriptor: string | null;
    is_active_user: boolean;
}

type AccessLog = {
    id: number
    emp_name: string
    emp_number: string
    room_name: string
    access_log_image_dir: string
    timestamp: Date | string
}

interface IControlService {
    checkWhiteListRFID: (room_id: number, rfid: string) => Promise<ResultModel<Partial<resultCheckWhiteList> | null>>
    saveToAccessLog: (rfid: string, room_id: number, image: string) => Promise<ResultModel<{ id: number } | null>>
    getLastTenAccess: () => Promise<ResultModel<AccessLog[] | null>>
    getAccessList: (limit: number, offset: number, room_id: number, user_id: number, startDate: string, endDate: string) => Promise<ResultModel<AccessLog[] | null>>
}

const prisma = new PrismaClient();

async function checkWhiteListRFIDHandler(room_id: number, rfid: string) {
    let result: Partial<resultCheckWhiteList>

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
                    number: rfid,
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

async function saveToAccessLogHandler(rfid: string, room_id: number, image: string) {
    const getUserRFID = await prisma.usersRFIDCard.findFirst({
        select: {
            id: true
        },
        where: {
            rfidIDFK: {
                number: rfid
            }
        }
    })

    if (!getUserRFID?.id) {
        throw new Error(`${rfid} tidak ditemukan`)
    }

    const saveAccessLog = await prisma.accessLog.create({
        data: {
            userrfid_id: getUserRFID?.id,
            room_id: room_id,
            access_log_image_dir: image,
            timestamp: new Date()
        },
        select: {
            id: true
        }
    })

    return {
        data: {
            id: saveAccessLog.id
        }
    }
}

async function getLastTenAccessHandler() {
    const getLastAccess = await prisma.accessLog.findMany({
        select: {
            id: true,
            userRFIDLogFK: {
                select: {
                    userIDFK: {
                        select: {
                            name: true,
                            emp_number: true
                        }
                    }
                }
            },
            roomIDLogFK: {
                select: {
                    name: true
                }
            },
            access_log_image_dir: true,
            timestamp: true
        },
        skip: 0,
        take: 10
    })

    let result: AccessLog[] = [];

    getLastAccess.map(item => {
        result.push({
            id: item.id,
            emp_name: item.userRFIDLogFK.userIDFK.name,
            emp_number: item.userRFIDLogFK.userIDFK.emp_number,
            room_name: item.roomIDLogFK.name,
            access_log_image_dir: item.access_log_image_dir,
            timestamp: item.timestamp
        });
    });

    return {
        data: result
    }
}

async function getAccessListHandler(limit: number, offset: number, room_id: number, user_id: number, startDate: string, endDate: string) {
    const whereConditions: Prisma.AccessLogWhereInput[] = [];

    if (room_id) {
        whereConditions.push({
            room_id: room_id
        });
    }

    if (user_id) {
        whereConditions.push({
            userRFIDLogFK: {
                userIDFK: {
                    id: user_id,
                },
            },
        });
    }

    if (startDate && endDate) {
        whereConditions.push({
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        });
    } else if (startDate) {
        whereConditions.push({
            timestamp: {
                gte: new Date(startDate),
            },
        });
    } else if (endDate) {
        whereConditions.push({
            timestamp: {
                lte: new Date(endDate),
            },
        });
    }

    const getAccessList = await prisma.accessLog.findMany({
        where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
        select: {
            id: true,
            userRFIDLogFK: {
                select: {
                    userIDFK: {
                        select: {
                            name: true,
                            emp_number: true,
                        },
                    },
                },
            },
            roomIDLogFK: {
                select: {
                    name: true,
                },
            },
            access_log_image_dir: true,
            timestamp: true,
        },
        skip: offset,
        take: limit,
    });

    const result = getAccessList.map((item) => ({
        id: item.id,
        emp_name: item.userRFIDLogFK.userIDFK.name,
        emp_number: item.userRFIDLogFK.userIDFK.emp_number,
        room_name: item.roomIDLogFK.name,
        access_log_image_dir: item.access_log_image_dir,
        timestamp: item.timestamp,
    }));

    return {
        data: result,
    };
}


const controlService: IControlService = {
    checkWhiteListRFID: checkWhiteListRFIDHandler,
    saveToAccessLog: saveToAccessLogHandler,
    getLastTenAccess: getLastTenAccessHandler,
    getAccessList: getAccessListHandler
}

export default controlService