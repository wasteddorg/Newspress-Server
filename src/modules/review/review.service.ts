import { prisma } from "../../lib/prisma";

const createReview = async (
    studentId: string, 
    tutorId: string,
    bookingId: string,
    rating: number,
    comment: string
) => {
    return await prisma.$transaction(async (tx) => {
        const existingReview = await tx.review.findUnique({
            where: { bookingId }
        });

        if (existingReview) {
            throw new Error("You have already submitted a review for this booking!");
        }

        const booking = await tx.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            throw new Error(`Invalid Booking ID: ${bookingId}. Session not found.`);
        }

        const review = await tx.review.create({
            data: {
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                bookingId,
                rating,
                comment
            }
        });

        const avgData = await tx.review.aggregate({
            where: { tutorId: booking.tutorId },
            _avg: { rating: true }
        });

        await tx.tutorProfile.update({
            where: { id: booking.tutorId },
            data: { averageRating: avgData._avg.rating || 0 }
        });

        return review;
    });
};

export const ReviewService = { createReview };