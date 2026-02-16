import { prisma } from "../../lib/prisma";

const getStudentStats = async (studentId: string) => {
    const [totalBookings, pendingBookings, completedBookings] = await Promise.all([
        prisma.booking.count({ where: { studentId } }),
        prisma.booking.count({ where: { studentId, status: "PENDING" } }),
        prisma.booking.count({ where: { studentId, status: "COMPLETED" } })
    ]);

    return { totalBookings, pendingBookings, completedBookings };
};

const getTutorStats = async (tutorUserId: string) => {
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId: tutorUserId },
        select: { id: true, averageRating: true, experience: true }
    });

    if (!tutorProfile) {
        return { totalSessions: 0, averageRating: 0, experience: 0 };
    }

    const totalSessions = await prisma.booking.count({
        where: { 
            tutorId: tutorProfile.id,
            status: "CONFIRMED" 
        }
    });

    return {
        totalSessions,
        averageRating: tutorProfile.averageRating || 0,
        experience: tutorProfile.experience || 0
    };
};

export const StatsService = {
    getStudentStats,
    getTutorStats
}