import { NextFunction, Request, Response } from "express";
import { expressHandler } from "../../types/types";
import usersLoginService from "../../services/userslogin.service";
import * as bcrypt from "bcrypt"
import { HttpError } from "../../middleware/error";

interface IUsersLoginController {
    register: expressHandler
}

async function registerHandler(req: Request, res: Response, next: NextFunction){
    const newUser = req.body
    const password = await bcrypt.hash(newUser.password, 10)
    const register = await usersLoginService.registerUser(newUser.username, password)

    if ("data" in register!){
        res.send(register)
    }
}

export const usersLoginController: IUsersLoginController = {
    register: registerHandler
}