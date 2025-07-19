import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import usersRoomsService from "../../services/usersrooms.service";
import { HttpError } from "../../middleware/error";

interface IUserRfidRoomsController {
    getUnassignedUsers: expressHandler,
    getAccessListUsers: expressHandler,
    assignUser: expressHandler,
    unassignUser: expressHandler,
}

async function getUnassignedUsersHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: req.params.id ? Number(req.params.id) : null,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined
    }

    if (data.id === null){
        throw new HttpError("ID Ruangan Kosong", 400)
    }

    const unassignedUsers = await usersRoomsService.getUnassignedUsers(data.id, data.keyword)

    if ("data" in unassignedUsers!) {
        res.json({
            status: "success",
            data: unassignedUsers.data,
        })
    }
}

async function getAccessListUsersHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: req.params.id ? Number(req.params.id) : undefined,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined
    }

    if (data.id == undefined){
        throw new HttpError("ID Ruangan Kosong", 400)
    }

    const accessListUsers = await usersRoomsService.getAccessListUsers(data.id, data.limit, data.offset, data.keyword)

    // console.log(accessListUsers)

    if ("data" in accessListUsers!) {
        res.json({
            status: "success",
            data: accessListUsers.data,
            count: accessListUsers.count
        })
    }
}

async function assignUserHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        idRfidUser: req.body.idRfidUser ? Number(req.body.idRfidUser) : undefined,
        idRoom: req.body.idRoom ? Number(req.body.idRoom) : undefined,
    }

    if (data.idRfidUser == undefined || data.idRoom == undefined){
        throw new HttpError("Data ID Kosong", 400)
    }

    const assignUsers = await usersRoomsService.assignUser(data.idRfidUser, data.idRoom)

    console.log(assignUsers)

    if ("data" in assignUsers!) {
        res.json({
            status: "success",
            data: assignUsers.data
        })
    }
}

async function unassignUserHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: req.params.id ? Number(req.params.id) : undefined
    }

    if (data.id == undefined){
        throw new HttpError("Data ID Kosong", 400)
    }

    const unassignUsers = await usersRoomsService.unassignUser(data.id)

    console.log(unassignUsers)

    if ("data" in unassignUsers!) {
        res.json({
            status: "success",
            data: unassignUsers.data
        })
    }
}

export const userRfidRoomsController: IUserRfidRoomsController = {
    getUnassignedUsers: getUnassignedUsersHandler,
    getAccessListUsers: getAccessListUsersHandler,
    assignUser: assignUserHandler,
    unassignUser: unassignUserHandler,
}