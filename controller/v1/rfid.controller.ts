import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import rfidService from "../../services/rfid.service";

interface IRFIDController {
    createRFID: expressHandler,
    updateRFID: expressHandler,
    readAllRFID: expressHandler,
    deleteRFID: expressHandler,
    getUnassignedRFID: expressHandler
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

async function updateRFIDHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: Number(req.params.id),
        number: req.body.number ? String(req.body.number).toUpperCase() : undefined,
        is_active: req.body.is_active ? (req.body.is_active == 'true' ? true : false) : undefined
    }

    const updateRFID = await rfidService.updateRFID(data.id, data.number, data.is_active)

    if ("data" in updateRFID!) {
        res.json({
            status: "success",
            data: updateRFID.data,
            message: "Kartu RFID berhasil diupdate"
        })
    }
}

async function readAllRFIDHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined,
        is_active: req.query.is_active ? (req.query.is_active == 'true' ? true : false) : undefined
    }
    const readAllRFID = await rfidService.readAllRFID(filter.offset, filter.limit, filter.keyword, filter.is_active)

    if ("data" in readAllRFID!) {
        res.json({
            status: "success",
            data: readAllRFID.data,
            count: readAllRFID.count
        })
    }
}

async function getUnassignedRFIDHandler(req: Request, res: Response, next: NextFunction) {
    const keyword = req.query.keyword !== undefined ? String(req.query.keyword) : undefined
    const unassignedRFID = await rfidService.getUnassignedRFID(keyword)

    console.log(keyword)

    if ("data" in unassignedRFID!) {
        res.json({
            status: "success",
            data: unassignedRFID.data
        })
    }
}

async function deleteRFIDHandler(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id)
    const deleteRFID = await rfidService.deleteRFID(id)

    if ("data" in deleteRFID!) {
        res.json({
            status: "success",
            data: deleteRFID.data,
            message: "Kartu RFID berhasil dihapus"
        })
    }
}

export const rfidController: IRFIDController = {
    createRFID: createRFIDHandler,
    updateRFID: updateRFIDHandler,
    readAllRFID: readAllRFIDHandler,
    deleteRFID: deleteRFIDHandler,
    getUnassignedRFID: getUnassignedRFIDHandler
}