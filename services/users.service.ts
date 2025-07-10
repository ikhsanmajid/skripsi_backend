import { Prisma, PrismaClient, TypeRole, Users } from "@prisma/client";
import { ResultModel } from "../types/types";

interface IUsersService {
    createUser: (name: string, emp_number: string, face_directory: string | undefined, face_descriptor: string | undefined) => Promise<ResultModel<Users | any | null>>,
    updateUser: (id: number, name: string | undefined, emp_number: string | undefined, face_directory: string | undefined, face_descriptor: string | undefined, is_active: boolean | undefined) => Promise<ResultModel<Users | any | null>>
    readAllUser: (offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined) => Promise<ResultModel<Users[] | any | null>>
    getCountUser: () => Promise<ResultModel<Users | any | null>>
    readUserById: (id: number) => Promise<ResultModel<Users | any | null>>
    deleteUser: (id: number) => Promise<ResultModel<Users | any | null>>
}

const prisma = new PrismaClient();

async function createUserHandler(name: string, emp_number: string, face_directory: string | undefined, face_descriptor: string | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const createUser = await prisma.users.create({
            data: {
                name: name,
                emp_number: emp_number,
                face_directory: face_directory,
                face_descriptor: face_descriptor,
                is_active: true
            },
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
                is_active: true
            }
        })

        return {
            data: createUser
        }
    } catch (error: unknown) {
        throw error

    }
}

async function updateUserHandler(id: number, name: string | undefined, emp_number: string | undefined, face_directory: string | undefined, face_descriptor: string | undefined, is_active: boolean | undefined): Promise<ResultModel<Users | any | null>> {
    try {
        const updateUser = await prisma.users.update({
            where: {
                id: id
            },
            data: {
                name: name,
                emp_number: emp_number,
                face_directory: face_directory,
                face_descriptor: face_descriptor,
                is_active: is_active
            },
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
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

async function readAllUserHandler(offset: number | undefined, limit: number | undefined, keyword: string | undefined, is_active: boolean | undefined): Promise<ResultModel<Users[] | any | null>> {
    try {

        const whereConditions: Prisma.UsersWhereInput[] = [];

        if (keyword) {
            whereConditions.push({
                OR: [
                    { name: { contains: keyword } },
                    { emp_number: { contains: keyword } }
                ]
            });
        }

        if (typeof is_active === 'boolean') {
            whereConditions.push({
                is_active: is_active
            });
        }

        const readAllUser = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
                is_active: true
            },
            where: {
                AND: whereConditions.length > 0 ? whereConditions : undefined

            },
            orderBy: {
                emp_number: 'asc'
            },
            skip: offset,
            take: limit
        })

        const count = await prisma.users.count({
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
        const countUser = await prisma.users.count({
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

async function readAUserByIdHandler(id: number): Promise<ResultModel<Users | any | null>> {
    try {
        const readUser = await prisma.users.findFirst({
            select: {
                id: true,
                name: true,
                emp_number: true,
                face_directory: true,
                face_descriptor: true,
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

async function deleteUserHandler(id: number): Promise<ResultModel<Users | any | null>> {
    const deleteUser = await prisma.users.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            emp_number: true
        }
    })

    return {
        data: deleteUser
    }
}

const usersService: IUsersService = {
    createUser: createUserHandler,
    updateUser: updateUserHandler,
    readAllUser: readAllUserHandler,
    readUserById: readAUserByIdHandler,
    getCountUser: getCountUserHandler,
    deleteUser: deleteUserHandler
}

export default usersService