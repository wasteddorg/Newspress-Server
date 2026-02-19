import { prisma } from "../../lib/prisma";

const getAdminStats = async () => {
    const [totalNews, totalUsers, totalCategories, totalComments, recentComments] = await Promise.all([
        prisma.post.count(),
        prisma.user.count(),
        prisma.category.count(),
        prisma.comment.count(),
        prisma.comment.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, image: true } },
                post: { 
                    select: { 
                        title: true, 
                        slug: true 
                    } 
                }
            }
        })
    ]);

    const categoryStats = await prisma.category.findMany({
        select: {
            name: true,
            _count: { select: { posts: true } }
        }
    });

    const monthlyNews = [
        { month: "Jan", total: await prisma.post.count({ where: { createdAt: { gte: new Date("2026-01-01"), lte: new Date("2026-01-31") } } }) },
        { month: "Feb", total: await prisma.post.count({ where: { createdAt: { gte: new Date("2026-02-01"), lte: new Date("2026-02-28") } } }) },
        { month: "Mar", total: 0 },
        { month: "Apr", total: 0 },
    ];

    return {
        totalNews,
        totalUsers,
        totalCategories,
        totalComments,
        recentComments,
        categoryStats: categoryStats.map(cat => ({ name: cat.name, comments: cat._count.posts })),
        monthlyNews
    };
};

export const StatsService = { getAdminStats };