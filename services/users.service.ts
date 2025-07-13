import { Prisma, PrismaClient, TypeRole, Users } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IUsersService {
    createUser: (name: string, emp_number: string, face_directory: string | undefined, face_descriptor: string | undefined) => Promise<ResultModel<Users | any | null>>,
    updateUser: (id: number, name: string | undefined, emp_number: string | undefined, face_directory: string | undefined, face_descriptor: string | undefined, rfid: number | undefined, is_active: boolean | undefined) => Promise<ResultModel<Users | any | null>>
    readAllUser: (offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined) => Promise<ResultModel<Users[] | any | null>>
    getCountUser: () => Promise<ResultModel<Users | any | null>>
    readUserById: (id: number) => Promise<ResultModel<Users | any | null>>
    deleteUser: (id: number) => Promise<ResultModel<Users | any | null>>
}

const prisma = new PrismaClient();

async function createUserHandler(name: string, emp_number: string, face_directory: string | undefined, face_descriptor: string | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const createUser = await prisma.users.create({
            data: {
                name: name,
                emp_number: emp_number,
                face_directory: face_directory,
                face_descriptor: face_descriptor,
                is_active: true
            },
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
                is_active: true
            }
        })

        return {
            data: createUser
        }
    } catch (error: unknown) {
        throw error

    }
}

async function updateUserHandler(id: number, name: string | undefined, emp_number: string | undefined, face_directory: string | undefined, face_descriptor: string | undefined, rfid: number | undefined, is_active: boolean | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const transactionUpdate = await prisma.$transaction(async (tx) => {
            const updateUser = await tx.users.update({
                where: {
                    id: id
                },
                data: {
                    name: name,
                    emp_number: emp_number,
                    face_directory: face_directory,
                    face_descriptor: face_descriptor,
                    is_active: is_active
                },
                select: {
                    userRFIDUser: {
                        select: {
                            id: true
                        }
                    }
                }
            })

            const existingAssignment = updateUser.userRFIDUser[0];

            if (rfid) {
                if (existingAssignment) {
                    await tx.usersRFIDCard.update({
                        where: { id: existingAssignment.id },
                        data: {
                            rfid_id: rfid
                        }
                    });
                } else {
                    await tx.usersRFIDCard.create({
                        data: {
                            user_id: id,
                            rfid_id: rfid
                        }
                    });
                }
            } else {
                if (existingAssignment) {
                    await tx.usersRFIDCard.delete({
                        where: { id: existingAssignment.id }
                    });
                }
            }

            return updateUser
        })


        return {
            data: transactionUpdate
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAllUserHandler(offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined): Promise<ResultModel<Users[] | any | null>> {
    try {

        const whereConditions: Prisma.UsersWhereInput[] = [];

        if (keyword) {
            whereConditions.push({
                OR: [
                    { name: { contains: keyword } },
                    { emp_number: { contains: keyword } },
                    { userRFIDUser: {
                        some: {
                            OR: [{
                                rfidIDFK: {
                                    number: { contains: keyword }
                                }
                            }]
                        }
                    } 
                        
                    }
                ]
            });
        }

        if (typeof is_active === 'boolean') {
            whereConditions.push({
                is_active: is_active
            });
        }

        const readAllUser = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
                is_active: true,
                userRFIDUser: {
                    select: {
                        id: true,
                        rfidIDFK: {
                            select: {
                                id: true,
                                number: true
                            }
                        }
                    }
                }
            },
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
            orderBy: {
                emp_number: 'asc'
            },
            skip: offset,
            take: limit
        })

        const flattenResult = readAllUser.map((user) => {
            const rfidRel = user.userRFIDUser?.[0]?.rfidIDFK;
            return {
                ...user,
                idRfidUser: rfidRel ? user.userRFIDUser?.[0].id : null,
                rfid: rfidRel ? {
                    id: rfidRel.id,
                    number: rfidRel.number
                } : null,
                userRFIDUser: undefined
            }
        })

        const count = await prisma.users.count({
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
        });

        return {
            data: flattenResult,
            count: count
        }
    } catch (error: unknown) {
        throw error

    }
}

async function getCountUserHandler() {
    try {
        const countUser = await prisma.users.count({
            where: {
                is_active: true
            }
        })

        return {
            count: countUser
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAUserByIdHandler(id: number): Promise<ResultModel<Users | any | null>> {
    try {
        const readUser = await prisma.users.findFirst({
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
                is_active: true
            },
            where: {
                id: id
            }
        })

        const readRFID = await prisma.usersRFIDCard.findFirst({
            select: {
                rfidIDFK: {
                    select: {
                        id: true,
                        number: true
                    }
                }
            },
            where: {
                user_id: id
            }
        })

        const result = {
            ...readUser,
            rfid: {
                number: readRFID?.rfidIDFK.number ?? null,
                id: readRFID?.rfidIDFK.id ?? null
            }
        }

        return {
            data: result
        }
    } catch (error: unknown) {
        throw error

    }
}

async function deleteUserHandler(id: number): Promise<ResultModel<Users | any | null>> {
    const deleteUser = await prisma.users.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            emp_number: true
        }
    })

    return {
        data: deleteUser
    }
}

const usersService: IUsersService = {
    createUser: createUserHandler,
    updateUser: updateUserHandler,
    readAllUser: readAllUserHandler,
    readUserById: readAUserByIdHandler,
    getCountUser: getCountUserHandler,
    deleteUser: deleteUserHandler
}

export default usersService