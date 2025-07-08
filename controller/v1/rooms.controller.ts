import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import roomsService from "../../services/rooms.service";

interface IRoomsController {
    createRoom: expressHandler,
    updateRoom: expressHandler,
    readAllRoom: expressHandler,
    getCountRoom: expressHandler,
    deleteRoom: expressHandler
}

async function createRoomHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        name: req.body.name,
        secret: req.body.secret,
        ip_address: req.body.ip_address
    }

    const createRoom = await roomsService.createRoom(data.name, data.secret, data.ip_address)

    if ("data" in createRoom!) {
        res.json({
            status: "success",
            data: createRoom.data,
            message: "Ruangan berhasil ditambahkan"
        })
    }
}

async function updateRoomHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: Number(req.params.id),
        name: req.body.name ? req.body.name : undefined,
        secret: req.body.secret ? req.body.secret : undefined,
        ip_address: req.body.ip_address ? req.body.ip_address : undefined
    }

    const updateRoom = await roomsService.updateRoom(data.id, data.name, data.secret, data.ip_address)

    if ("data" in updateRoom!) {
        res.json({
            status: "success",
            data: updateRoom.data,
            message: "Ruangan berhasil diupdate"
        })
    }
}

async function readAllRoomHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined
    }
    const readAllRoom = await roomsService.readAllRoom(filter.offset, filter.limit, filter.keyword)

    if ("data" in readAllRoom!) {
        res.json({
            status: "success",
            data: readAllRoom.data,
            count: readAllRoom.count
        })
    }
}

async function getCountRoomHandler(req: Request, res: Response, next: NextFunction) {
    const getCount = await roomsService.getCountRoom()

    if ("count" in getCount!) {
        res.json({
            status: "success",
            count: getCount.count
        })
    }
}

async function deleteRoomHandler(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id)
    const deleteRoom = await roomsService.deleteRoom(id)

    if ("data" in deleteRoom!) {
        res.json({
            status: "success",
            data: deleteRoom.data,
            message: "Ruangan berhasil dihapus"
        })
    }
}

export const roomsController: IRoomsController = {
    createRoom: createRoomHandler,
    updateRoom: updateRoomHandler,
    readAllRoom: readAllRoomHandler,
    getCountRoom: getCountRoomHandler,
    deleteRoom: deleteRoomHandler
}