import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import controlService from "../../services/control.service";
import { HttpError } from "../../middleware/error";

interface IAccessLogController {
    getLastTenAccess: expressHandler
}

async function getLastAccessHandler(req: Request, res: Response, next: NextFunction) {
    const getLastAccess = await controlService.getLastTenAccess()

    if ("data" in getLastAccess!) {
        res.json({
            status: "success",
            data: getLastAccess.data
        })
    }
}

async function getAccessListHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: req.query.offset ? Number(req.query.offset) : 0,
        room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        startDate: req.query.start_date ? String(req.query.start_date) : undefined,
        endDate: req.query.end_date ? String(req.query.end_date) : undefined,
    }

    if(!filter.room_id || !filter.user_id || !filter.startDate || !filter.endDate) {
        throw new HttpError("Input tidak lengkap", 400)
    }

    const accessList = await controlService.getAccessList(
        filter.limit,
        filter.offset,
        filter.room_id,
        filter.user_id,
        filter.startDate,
        filter.endDate
    )

    if ("data" in accessList!) {
        res.json({
            status: "success",
            data: accessList.data
        })
    }
}


export const AccessLogController: IAccessLogController = {
    getLastTenAccess: getLastAccessHandler
}