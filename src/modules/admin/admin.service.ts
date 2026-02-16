import { UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            status: true,
            createdAt: true,
            tutorProfile: {
                include: {
                    categories: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// const toggleUserStatus = async (userId: string, status: UserStatus) => { 
//     return await prisma.user.update({
//         where: { id: userId },
//         data: {
//             status: status 
//         }
//     });
// };

const toggleUserStatus = async (userId: string, status: UserStatus) => {
    return await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                status: status
            }
        });

        if (status === "BLOCKED" || status === "SUSPENDED") {
            await tx.session.deleteMany({
                where: { userId: userId }
            });
        }

        return updatedUser;
    });
};


const getAllBookings = async () => {
    return await prisma.booking.findMany({
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            },
            tutor: {
                select: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            slot: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const updateUserRoleInDB = async (userId: string, role: UserRole) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { role: role }
    });
};


const createCategoryInDB = async (name: string) => {
    return await prisma.category.create({
        data: { name }
    });
};

const getAllCategoriesFromDB = async () => {
    return await prisma.category.findMany({
        include: {
            _count: {
                select: { tutors: true }
            }
        },
        orderBy: { name: 'asc' }
    });
};



export const AdminService = {
    getAllUsers,
    toggleUserStatus,
    updateUserRoleInDB,
    getAllBookings,
    createCategoryInDB,
    getAllCategoriesFromDB,

};