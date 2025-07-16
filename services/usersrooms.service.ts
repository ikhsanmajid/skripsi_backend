import { Prisma, PrismaClient, Rooms, Users } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IUserRfidRoomsService {
    getUnassignedUsers: (id: number, keyword: string | undefined) => Promise<ResultModel<any>>
    getAccessListUsers: (id: number, limit: number | undefined, offset: number | undefined, keyword: string | undefined) => Promise<ResultModel<any>>
    assignUser: (idRfidUser: number, idRoom: number) => Promise<ResultModel<any>>
    unassignUser: (id: number) => Promise<ResultModel<any>>
}

const prisma = new PrismaClient();

async function getUnassignedUsersHandler(id: number, keyword: string | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const getUnassignedRFIDCards = await prisma.usersRFIDCard.findMany({
            where: {
                UserRFIDCardRooms: {
                    none: {
                        room_id: id, // hanya RFID yang belum terdaftar di ruangan ini
                    },
                },

                OR: [
                    {
                        userIDFK: {
                            userRFIDUser: {
                                some: {}, // pastikan user memang punya RFID (sudah pasti karena ini berasal dari UsersRFIDCard)
                            },
                            name: {
                                contains: keyword,

                            },
                        }
                    },
                    {
                        rfidIDFK: {
                            userRFIDCard: {
                                some: {}
                            },
                            number: {
                                contains: keyword,

                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                userIDFK: {
                    select: {
                        id: true,
                        name: true,
                        emp_number: true,
                    },
                },
                rfidIDFK: {
                    select: {
                        id: true,
                        number: true,
                    },
                },
            },
        });

        const flattenResult = getUnassignedRFIDCards.map((rel) => ({
            id: rel.userIDFK.id,
            name: rel.userIDFK.name,
            emp_number: rel.userIDFK.emp_number,
            idRfidUser: rel.id,
            rfid: {
                id: rel.rfidIDFK.id,
                number: rel.rfidIDFK.number,
            },
        }));

        return {
            data: flattenResult
        }
    } catch (error: unknown) {
        throw error

    }
}

async function getAccessListUsersHandler(id: number, limit: number | undefined, offset: number | undefined, keyword: string | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const getAccessList = await prisma.usersRFIDCardRoom.findMany({
            where: {
                room_id: id,
                OR: [
                    {
                        userRFIDFK: {
                            userIDFK: {
                                name: {
                                    contains: keyword
                                }
                            }
                        }
                    },
                    {
                        userRFIDFK: {
                            rfidIDFK: {
                                number: {
                                    contains: keyword
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                room_id: true,
                userRFIDFK: {
                    select: {
                        id: true,
                        userIDFK: {
                            select: {
                                id: true,
                                name: true,
                                emp_number: true,
                                is_active: true,
                            },
                        },
                        rfidIDFK: {
                            select: {
                                id: true,
                                number: true,
                                is_active: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    userRFIDFK: {
                        userIDFK: {
                            name: 'asc'
                        }
                    }
                }
            ],
            skip: offset,
            take: limit
        })

        const countData = await prisma.usersRFIDCardRoom.count({
            where: {
                room_id: id,
                OR: [
                    {
                        userRFIDFK: {
                            userIDFK: {
                                name: {
                                    contains: keyword
                                }
                            }
                        }
                    },
                    {
                        userRFIDFK: {
                            rfidIDFK: {
                                number: {
                                    contains: keyword
                                }
                            }
                        }
                    }
                ]
            }
        })

        const flattenResult = getAccessList.map((rel) => {
            const user = rel.userRFIDFK.userIDFK;
            const rfid = rel.userRFIDFK.rfidIDFK;

            return {
                id: rel.id,
                name: user.name,
                emp_number: user.emp_number,
                idRfidUser: rel.userRFIDFK.id,
                rfid: {
                    id: rfid.id,
                    number: rfid.number,
                },
            };
        });

        return {
            data: flattenResult,
            count: countData
        }
    } catch (error: unknown) {
        throw error

    }
}

async function assignUserHandler(idRfidUser: number, idRoom: number) {
    try {
        const assignUser = await prisma.usersRFIDCardRoom.create({
            data: {
                userrfid_id: idRfidUser,
                room_id: idRoom
            },
            select: {
                id: true
            }
        })

        return {
            data: assignUser
        }

    } catch (error: unknown) {
        throw error
    }
}

async function unassignUserHandler(id: number) {
    try {
        const unassignUser = await prisma.usersRFIDCardRoom.delete({
            where: {
                id: id
            },
            select: {
                id: true
            }
        })

        return {
            data: unassignUser
        }

    } catch (error: unknown) {
        throw error
    }
}

const usersRoomsService: IUserRfidRoomsService = {
    getUnassignedUsers: getUnassignedUsersHandler,
    getAccessListUsers: getAccessListUsersHandler,
    assignUser: assignUserHandler,
    unassignUser: unassignUserHandler,

}

export default usersRoomsService