import { prisma } from "../../lib/prisma";

const createBooking = async (studentId: string, tutorId: string, slotId: string) => {
    return await prisma.$transaction(async (tx) => {
        const slot = await tx.availabilitySlot.findUnique({
            where: { id: slotId }
        });

        if (!slot) throw new Error("This slot does not exist!");
        if (slot.isBooked) throw new Error("This slot is already taken!");

        const existingBooking = await tx.booking.findFirst({
            where: {
                studentId,
                slotId,
                status: { not: "CANCELLED" }
            }
        });

        if (existingBooking) throw new Error("You already have an active booking for this slot!");

        const booking = await tx.booking.create({
            data: {
                studentId,
                tutorId,
                slotId,
                status: "CONFIRMED"
            }
        });

        await tx.availabilitySlot.update({
            where: { id: slotId },
            data: { isBooked: true }
        });

        return booking;
    });
};

const getMyBookings = async (userId: string, role: string) => {
    if (role === "TUTOR") {
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId }
        });

        if (!tutorProfile) return [];

        return await prisma.booking.findMany({
            where: { tutorId: tutorProfile.id },
            include: {
                student: { select: { name: true, image: true, email: true } },
                slot: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } else {
        return await prisma.booking.findMany({
            where: {
                studentId: userId,
                status: {
                    not: "CANCELLED"
                }
            },
            include: {
                tutor: { include: { user: { select: { name: true, image: true } } } },
                slot: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};

const getBookingById = async (id: string) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            tutor: { include: { user: { select: { name: true, image: true, email: true } } } },
            student: { select: { name: true, email: true } },
            slot: true
        }
    });
};

const updateBookingStatus = async (bookingId: string, userId: string, status: any) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tutor: true }
    });

    if (!booking) throw new Error("Booking not found!");

    if (booking.tutor.userId !== userId && booking.studentId !== userId) {
        throw new Error("You are not authorized to update this booking!");
    }

    return await prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status },
        });

        if (status === "CANCELLED") {
            await tx.availabilitySlot.update({
                where: { id: booking.slotId },
                data: { isBooked: false },
            });
        }

        return updatedBooking;
    });
};

export const BookingService = {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    getBookingById
};