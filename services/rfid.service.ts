import { Prisma, PrismaClient, RFIDCard } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IRFIDService {
    createRFID: (number: string) => Promise<ResultModel<RFIDCard | any | null>>,
    updateRFID: (id: number, number: string | undefined, is_active: boolean | undefined) => Promise<ResultModel<RFIDCard | any | null>>
    readAllRFID: (offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined) => Promise<ResultModel<RFIDCard[] | any | null>>
    deleteRFID: (id: number) => Promise<ResultModel<RFIDCard | any | null>>
    getUnassignedRFID: (keyword: string | undefined) => Promise<ResultModel<RFIDCard | any | null>>
}

const prisma = new PrismaClient();

async function createRFIDHandler(number: string): Promise<ResultModel<RFIDCard | any | null>> {
    try {
        const createRFID = await prisma.rFIDCard.create({
            data: {
                number: number,
                is_active: true
            },
            select: {
                number: true,
                is_active: true
            }
        })

        return {
            data: createRFID
        }
    } catch (error: unknown) {
        throw error

    }
}

async function updateRFIDHandler(id: number, number: string | undefined, is_active: boolean | undefined): Promise<ResultModel<RFIDCard | any | null>> {
    try {
        const updateRFID = await prisma.rFIDCard.update({
            where: {
                id: id
            },
            data: {
                number: number,
                is_active: is_active
            },
            select: {
                id: true,
                number: true,
                is_active: true
            }
        })

        return {
            data: updateRFID
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAllRFIDHandler(offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined): Promise<ResultModel<RFIDCard[] | any | null>> {
    try {

        const whereConditions: Prisma.RFIDCardWhereInput[] = [];

        if (keyword) {
            whereConditions.push({
                OR: [
                    { number: { contains: keyword } },
                ]
            });
        }

        if (typeof is_active === 'boolean') {
            whereConditions.push({
                is_active: is_active
            });
        }

        const readAllRFID = await prisma.rFIDCard.findMany({
            select: {
                id: true,
                number: true,
                is_active: true
            },
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
            orderBy: {
                number: 'asc'
            },
            skip: offset,
            take: limit
        })

        const count = await prisma.rFIDCard.count({
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
        });

        return {
            data: readAllRFID,
            count: count
        }
    } catch (error: unknown) {
        throw error

    }
}

async function getUnassignedRFIDHandler(keyword: string | undefined) {
    const unassignedRFID = await prisma.rFIDCard.findMany({
        where: {
            number: {
                contains: keyword
            },
            is_active: true,
            userRFIDCard: {
                none: {}
            }
        },
        take: 10
    })

    return {
        data: unassignedRFID
    }
}

async function deleteRFIDHandler(id: number): Promise<ResultModel<RFIDCard | any | null>> {
    const deleteRFID = await prisma.rFIDCard.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            number: true,
            is_active: true
        }
    })

    return {
        data: deleteRFID
    }
}

const rfidService: IRFIDService = {
    createRFID: createRFIDHandler,
    updateRFID: updateRFIDHandler,
    readAllRFID: readAllRFIDHandler,
    deleteRFID: deleteRFIDHandler,
    getUnassignedRFID: getUnassignedRFIDHandler
}

export default rfidService