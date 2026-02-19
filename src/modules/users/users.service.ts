import { prisma } from "../../lib/prisma";

const getAllUsersFromDB = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const updateUserRoleInDB = async (userId: string, role: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { role }
    });
};

export const UserService = {
    getAllUsersFromDB,
    updateUserRoleInDB
};