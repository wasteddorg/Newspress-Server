import { prisma } from "../../lib/prisma.js";

const createNews = async (data: any, authorId: string) => {
    const slug = data.title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + Date.now();

    return await prisma.post.create({
        data: {
            ...data,
            slug,
            authorId,
        },
    });
};

const getAllNews = async () => {
    return await prisma.post.findMany({
        include: {
            category: { select: { name: true, slug: true } },
            author: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getNewsBySlug = async (slug: string) => {
    return await prisma.post.update({
        where: { slug },
        data: {
            viewCount: {
                increment: 1,
            },
        },
        include: {
            category: true,
            author: { select: { name: true, image: true } },
            comments: {
                include: {
                    user: { select: { name: true, image: true } },
                },
            },
        },
    });
};

const updateNews = async (id: string, data: any) => {
    return await prisma.post.update({
        where: { id },
        data,
    });
};

const deleteNews = async (id: string) => {
    return await prisma.post.delete({
        where: { id },
    });
};

export const NewsService = {
    createNews,
    getAllNews,
    getNewsBySlug,
    updateNews,
    deleteNews,
};