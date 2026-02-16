import { prisma } from "../../lib/prisma";

const createCategory = async (subjectName: string) => {
    const isExist = await prisma.category.findUnique({
        where: { name: subjectName },
    });

    if (isExist) {
        throw new Error(`Subject '${subjectName}' already exists.`);
    }

    return await prisma.category.create({
        data: { name: subjectName },
    });
};

const getAllCategories = async () => {
    return await prisma.category.findMany({
        include: {
            tutors: {
                select: {
                    id: true 
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });
};

const updateCategoryInDB = async (id: string, name: string) => {
    return await prisma.category.update({
        where: { id },
        data: { name: name }
    });
};

const deleteCategoryFromDB = async (id: string) => {
    return await prisma.category.delete({
        where: { id }
    });
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    updateCategoryInDB,
    deleteCategoryFromDB
};