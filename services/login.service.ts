import { PrismaClient, TypeRole } from "@prisma/client";
import { ResultModel } from "../types/types";

interface ILoginService {
    findUsername: (username: string) => Promise<ResultModel<LoginUser | any | null>>
}

interface LoginUser {
    id: number;
    username: string;
    password: string;
    role: TypeRole;
    is_active: boolean;
}

const prisma = new PrismaClient();

async function findUsernameHandler(username: string): Promise<ResultModel<LoginUser | any | null>> {
    try {
        const login = await prisma.usersLogin.findUnique({
            where:  {
                username: username
            },
            select: {
                id: true,
                username: true,
                password: true,
                role: true,
                is_active: true
            }
        })

        if (login == null){
            return {
                data: null
            }
        }

        return { 
            data: login
        }

    } catch (error: unknown) {
        throw error

    }
}

const loginService: ILoginService = {
    findUsername: findUsernameHandler
}

export default loginService