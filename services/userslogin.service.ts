import { Prisma, PrismaClient, TypeRole, Users, UsersLogin } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IUsersLoginService {
    registerUser: (username: string, password: string) => Promise<ResultModel<UsersLogin | any | null>>
    updateUser: (id: number, username: string | undefined, password: string | undefined, role: TypeRole | undefined, is_active: boolean | undefined) => Promise<ResultModel<UsersLogin | any | null>>
    readAllUser: (offset: number | undefined, limit: number | undefined, keyword: string | undefined, role: TypeRole | undefined, is_active: boolean | undefined) => Promise<ResultModel<UsersLogin[] | any | null>>
    getCountUser: () => Promise<ResultModel<UsersLogin | any | null>>
    readUserById: (id: number) => Promise<ResultModel<UsersLogin | any | null>>
    deleteUser: (id: number) => Promise<ResultModel<UsersLogin | any | null>>
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

async function updateUserHandler(id: number, username: string | undefined, password: string | undefined, role: TypeRole | undefined, is_active: boolean | undefined): Promise<ResultModel<UsersLogin | any | null>> {
    try {
        const updateUser = await prisma.usersLogin.update({
            where: {
                id: id
            },
            data: {
                username: username,
                password: password,
                role: role,
                is_active: is_active
            },
            select: {
                id: true,
                username: true,
                role: true,
                is_active: true
            }
        })

        return {
            data: updateUser
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAllUserHandler(offset: number | undefined, limit: number | undefined, keyword: string | undefined = undefined, role: TypeRole | undefined = undefined, is_active: boolean | undefined): Promise<ResultModel<UsersLogin[] | any | null>> {
    try {

        const whereConditions: Prisma.UsersLoginWhereInput[] = [];

        if (keyword) {
            whereConditions.push({
                OR: [
                    { username: { contains: keyword } },
                ]
            });
        }

        if (role) {
            whereConditions.push({
                role: role
            })
        }

        if (typeof is_active === 'boolean') {
            whereConditions.push({
                is_active: is_active
            });
        }

        const readAllUser = await prisma.usersLogin.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                is_active: true
            },
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
            orderBy: {
                username: 'asc'
            },
            skip: offset,
            take: limit
        })

        const count = await prisma.usersLogin.count({
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
        });

        return {
            data: readAllUser,
            count: count
        }
    } catch (error: unknown) {
        throw error

    }
}

async function getCountUserHandler() {
    try {
        const countUser = await prisma.usersLogin.count({
            where: {
                is_active: true
            }
        })

        return {
            count: countUser
        }
    } catch (error: unknown) {
        throw error

    }
}

async function readAUserByIdHandler(id: number) {
    try {
        const readUser = await prisma.usersLogin.findFirst({
            select: {
                id: true,
                username: true,
                role: true,
                is_active: true
            },
            where: {
                id: id
            }
        })

        return {
            data: readUser
        }
    } catch (error: unknown) {
        throw error 

    }
}

async function deleteUserHandler(id: number) {
    const deleteUser = await prisma.usersLogin.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            username: true,
            role: true
        }
    })

    return {
        data: deleteUser
    }
}

const usersLoginService: IUsersLoginService = {
    registerUser: registerUserHandler,
    updateUser: updateUserHandler,
    readAllUser: readAllUserHandler,
    getCountUser: getCountUserHandler,
    readUserById: readAUserByIdHandler,
    deleteUser: deleteUserHandler

}

export default usersLoginService