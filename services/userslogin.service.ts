import { PrismaClient, TypeRole, Users, UsersLogin } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IUsersLoginService {
    registerUser: (username: string, password: string) => Promise<ResultModel<UsersLogin | any | null>>
}

const prisma = new PrismaClient();

async function registerUserHandler(username: string, password: string): Promise<ResultModel<UsersLogin | any | null>> {
    try {
        const register = await prisma.usersLogin.create({
            data: {
                username: username,
                password: password,
                role: TypeRole["ADMIN"],
                is_active: true
            }
        })

        return {
            data: register
        }
    } catch (error: unknown) {
        throw error

    }
}

const usersLoginService: IUsersLoginService = {
    registerUser: registerUserHandler
}

export default usersLoginService