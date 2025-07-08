import { Prisma, PrismaClient, Rooms } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IRoomsService {
    createRoom: (name: string, secret: string, ip_address: string | undefined) => Promise<ResultModel<Rooms | any | null>>,
    updateRoom: (id: number, name: string | undefined, secret: string | undefined, ip_address: string | undefined) => Promise<ResultModel<Rooms | any | null>>
    readAllRoom: (offset: number | undefined, limit: number | undefined, keyword: string | undefined) => Promise<ResultModel<Rooms[] | any | null>>
    getCountRoom: () => Promise<ResultModel<Rooms | any | null>>
    readByIdRoom: (id: number) => Promise<ResultModel<Rooms | any | null>>
    deleteRoom: (id: number) => Promise<ResultModel<Rooms | any | null>>
}

const prisma = new PrismaClient();

async function createRoomHandler(name: string, secret: string, ip_address: string | undefined): Promise<ResultModel<Rooms | any | null>> {
    try {
        const createRoom = await prisma.rooms.create({
            data: {
                name: name,
                secret: secret,
                ip_address: ip_address
            },
            select: {
                id: true,
                name: true,
                secret: true,
                ip_address: true
            }
        })

        return {
            data: createRoom
        }
    } catch (error: unknown) {
        throw error

    }
}

async function getCountRoomHandler() {
    try {
        const countRoom = await prisma.rooms.count()

        return {
            count: countRoom
        }
    } catch (error: unknown) {
        throw error

    }
}

async function updateRoomHandler(id: number, name: string | undefined, secret: string | undefined, ip_address: string | undefined): Promise<ResultModel<Rooms | any | null>> {
    try {
        const updateRoom = await prisma.rooms.update({
            where: {
                id: id
            },
            data: {
                name: name,
                secret: secret,
                ip_address: ip_address
            },
            select: {
                id: true,
                name: true,
                secret: true,
                ip_address: true
            }
        })

        return {
            data: updateRoom
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAllRoomHandler(offset: number | undefined, limit: number | undefined, keyword: string | undefined): Promise<ResultModel<Rooms[] | any | null>> {
    try {

        const whereConditions: Prisma.RoomsWhereInput[] = [];

        if (keyword) {
            whereConditions.push({
                OR: [
                    { name: { contains: keyword } },
                    { secret: { contains: keyword } },
                    { ip_address: { contains: keyword } }
                ]
            });
        }

        const readAllRooms = await prisma.rooms.findMany({
            select: {
                id: true,
                name: true,
                secret: true,
                ip_address: true
            },
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
            orderBy: {
                name: 'asc'
            },
            skip: offset,
            take: limit
        })

        const count = await prisma.rooms.count({
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
        });

        return {
            data: readAllRooms,
            count: count
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readRoomByIdHandler(id: number): Promise<ResultModel<Rooms | any | null>> {
    try {

        const readAllRooms = await prisma.rooms.findFirst({
            select: {
                id: true,
                name: true,
                secret: true,
                ip_address: true
            },
            where: {
                id: id

            }

        })

        return {
            data: readAllRooms,
        }
    } catch (error: unknown) {
        throw error

    }
}

async function deleteRoomHandler(id: number): Promise<ResultModel<Rooms | any | null>> {
    const deleteRoom = await prisma.rooms.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            secret: true,
            ip_address: true
        }
    })

    return {
        data: deleteRoom
    }
}

const roomsService: IRoomsService = {
    createRoom: createRoomHandler,
    updateRoom: updateRoomHandler,
    readAllRoom: readAllRoomHandler,
    getCountRoom: getCountRoomHandler,
    readByIdRoom: readRoomByIdHandler,
    deleteRoom: deleteRoomHandler
}

export default roomsService