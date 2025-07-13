import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import usersService from "../../services/users.service";
import * as fs from 'fs';
import { detectAndGetDescriptor } from "../../utils/face-recognition";
import { FaceDetection, FaceLandmarks68, WithFaceDescriptor, WithFaceLandmarks } from "@vladmandic/face-api";
import logger from "../../config/logger";
import { HttpError } from "../../middleware/error";

// Tensorflow section


interface IUsersController {
    createUser: expressHandler,
    updateUser: expressHandler,
    readAllUser: expressHandler,
    getUser: expressHandler,
    getCountUser: expressHandler,
    deleteUser: expressHandler
}

async function createUserHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const data = {
        ...req.body,
        file: req.file ? req.file.filename : undefined
    }

    let result: WithFaceDescriptor<WithFaceLandmarks<{ detection: FaceDetection; }, FaceLandmarks68>> | undefined

    if (data.file) {
        result = await detectAndGetDescriptor(`./face_image_dir/${data.file}`)
    }

    if (result == undefined) {
        return next(new HttpError("Data wajah tidak terdeteksi", 200))
    }

    const createUser = await usersService.createUser(data.name, data.emp_number, data.file, result?.descriptor.toString())

    if ("data" in createUser!) {
        res.json({
            status: "success",
            data: createUser.data,
            message: "User berhasil ditambahkan",
            fileMsg: result == undefined ? "Data muka tidak terdeteksi" : undefined
        })
    }
}

async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
    const data = {
        id: Number(req.params.id),
        name: req.body.name ? req.body.name : undefined,
        emp_number: req.body.emp_number ? req.body.emp_number : undefined,
        file: req.file ? req.file.filename : undefined,
        rfid: req.body.rfid ? Number(req.body.rfid) : undefined,
        is_active: req.body.is_active ? (req.body.is_active === 'true' ? true : false) : undefined
    }

    let result: WithFaceDescriptor<WithFaceLandmarks<{ detection: FaceDetection; }, FaceLandmarks68>> | undefined

    if (data.file) {
        result = await detectAndGetDescriptor(`./face_image_dir/${data.file}`)

        if (result == undefined) {
            fs.unlink(`./face_image_dir/${data.file}`, (err) => {
                if (err) {
                    logger.error({
                        message: "File gagal dihapus",
                        path: `./face_image_dir/${data.file}`,
                        error: err
                    })
                }
            })
        } else {
            const getImagePath = await usersService.readUserById(data.id)
            if ("data" in getImagePath!) {
                const userImagePath = getImagePath.data.face_directory
                fs.unlink(`./face_image_dir/${userImagePath}`, (err) => {
                    if (err) {
                        logger.error({
                            message: "File gagal dihapus",
                            path: `./face_image_dir/${data.file}`,
                            error: err
                        })
                    }
                })
            }
        }
    }

    const updateUser = await usersService.updateUser(data.id, data.name, data.emp_number, result == undefined ? undefined : data.file, result?.descriptor.toString(), data.rfid, data.is_active)



    if ("data" in updateUser!) {
        console.log(updateUser)
        res.json({
            status: "success",
            data: updateUser.data,
            message: "User berhasil diupdate",
            fileMsg: result == undefined ? "Data muka tidak terdeteksi" : undefined
        })
    }
}

async function readAllUserHandler(req: Request, res: Response, next: NextFunction) {
    const filter = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        keyword: req.query.keyword ? String(req.query.keyword) : undefined,
        is_active: req.query.is_active ? (req.query.is_active == 'true' ? true : false) : undefined
    }
    const readAllUser = await usersService.readAllUser(filter.offset, filter.limit, filter.keyword, filter.is_active)

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
    const readUser = await usersService.readUserById(filter.id)

    if ("data" in readUser!) {
        res.json({
            status: "success",
            data: readUser.data
        })
    }
}

async function getCountUserHandler(req: Request, res: Response, next: NextFunction) {
    const getCount = await usersService.getCountUser()

    if ("count" in getCount!) {
        res.json({
            status: "success",
            count: getCount.count
        })
    }
}

async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id)
    const deleteUser = await usersService.deleteUser(id)

    if ("data" in deleteUser!) {
        res.json({
            status: "success",
            data: deleteUser.data,
            message: "User berhasil dihapus"
        })
    }
}

export const usersController: IUsersController = {
    createUser: createUserHandler,
    updateUser: updateUserHandler,
    getUser: getUserHandler,
    readAllUser: readAllUserHandler,
    getCountUser: getCountUserHandler,
    deleteUser: deleteUserHandler
}