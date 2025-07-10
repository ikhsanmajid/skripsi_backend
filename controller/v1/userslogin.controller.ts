import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import usersLoginService from "../../services/userslogin.service";
import * as bcrypt from "bcrypt"
import { TypeRole } from "@prisma/client";

interface IUsersLoginController {
    register: expressHandler,
    updateUser: expressHandler,
    readAllUser: expressHandler,
    getUser: expressHandler,
    getCountUser: expressHandler,
    deleteUser: expressHandler
}

async function registerHandler(req: Request, res: Response, next: NextFunction) {
    const newUser = req.body
    const password = await bcrypt.hash(newUser.password, 10)
    const register = await usersLoginService.registerUser(newUser.username, password)

    if ("data" in register!) {
        res.json({
            status: "success",
            data: register.data,
            message: "User berhasil ditambahkan"
        })
    }
}

async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: Number(req.params.id),
        username: req.body.username ? req.body.username : undefined,
        password: req.body.password ? req.body.password : undefined,
        role: req.body.role ? req.body.role : undefined,
        is_active: req.body.is_active ? (req.body.is_active === 'true' ? true : false) : undefined
    }

    const hashPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined

    const updateUser = await usersLoginService.updateUser(data.id, data.username, hashPassword, data.role, data.is_active)

    if ("data" in updateUser!) {
        res.json({
            status: "success",
            data: updateUser.data,
            message: "User berhasil diupdate"
        })
    }
}

async function readAllUserHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined,
        role: req.query.role ? String(req.query.role).toUpperCase() as TypeRole : undefined,
        is_active: req.query.is_active ? (req.query.is_active == 'true' ? true : false) : undefined
    }
    const readAllUser = await usersLoginService.readAllUser(filter.offset, filter.limit, filter.keyword, filter.role, filter.is_active)

    if ("data" in readAllUser!) {
        res.json({
            status: "success",
            data: readAllUser.data,
            count: readAllUser.count
        })
    }
}

async function getUserHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        id: Number(req.params.id)
    }
    const readUser = await usersLoginService.readUserById(filter.id)

    if ("data" in readUser!) {
        res.json({
            status: "success",
            data: readUser.data
        })
    }
}

async function getCountUserHandler(req: Request, res: Response, next: NextFunction) {
    const getCount = await usersLoginService.getCountUser()

    if ("count" in getCount!) {
        res.json({
            status: "success",
            count: getCount.count
        })
    }
}

async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id)
    const deleteUser = await usersLoginService.deleteUser(id)

    if ("data" in deleteUser!) {
        res.json({
            status: "success",
            data: deleteUser.data,
            message: "User berhasil dihapus"
        })
    }
}

export const usersLoginController: IUsersLoginController = {
    register: registerHandler,
    updateUser: updateUserHandler,
    getUser: getUserHandler,
    readAllUser: readAllUserHandler,
    getCountUser: getCountUserHandler,
    deleteUser: deleteUserHandler
}