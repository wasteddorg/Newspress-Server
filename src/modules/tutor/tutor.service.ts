


import { prisma } from "../../lib/prisma";

const createOrUpdateProfile = async (userId: string, data: any) => {
    return await prisma.tutorProfile.upsert({
        where: { userId: userId },
        update: {
            bio: data.bio,
            pricePerHour: parseFloat(data.pricePerHour),
            experience: parseInt(data.experience),
            categories: {
                set: [],
                connect: [{ id: data.categoryId }]
            }
        },
        create: {
            userId: userId,
            bio: data.bio,
            pricePerHour: parseFloat(data.pricePerHour),
            experience: parseInt(data.experience),
            categories: {
                connect: [{ id: data.categoryId }]
            },
        },
    });
};

const updateAvailability = async (userId: string, slots: { startTime: string, endTime: string, day: string }[]) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { userId }
    });

    if (!tutor) throw new Error("Tutor profile not found!");

    return await prisma.$transaction(async (tx) => {
        await tx.availabilitySlot.deleteMany({
            where: {
                tutorId: tutor.id,
                isBooked: false
            }
        });

        const allGeneratedSlots: any[] = [];

        slots.forEach(slot => {
            let currentStart = new Date(slot.startTime);
            const finalEnd = new Date(slot.endTime);

            while (currentStart < finalEnd) {
                const nextHour = new Date(currentStart);
                nextHour.setHours(nextHour.getHours() + 1);

                if (nextHour <= finalEnd) {
                    allGeneratedSlots.push({
                        tutorId: tutor.id,
                        startTime: new Date(currentStart),
                        endTime: new Date(nextHour),
                    });
                }

                currentStart = new Date(nextHour);
            }
        });

        if (allGeneratedSlots.length > 0) {
            return await tx.availabilitySlot.createMany({
                data: allGeneratedSlots
            });
        }

        return { count: 0 };
    });
};



const getAllTutors = async (query: any) => {
    const { searchTerm, minPrice, maxPrice, sortBy, sortOrder, categoryId } = query;

    const where: any = {};

    if (categoryId) {
        where.categories = {
            some: { id: categoryId }
        };
    }

    if (searchTerm) {
        where.OR = [
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { bio: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }

    if (minPrice || maxPrice) {
        where.pricePerHour = {
            gte: minPrice ? parseFloat(minPrice) : undefined,
            lte: maxPrice ? parseFloat(maxPrice) : undefined,
        };
    }

    return await prisma.tutorProfile.findMany({
        where,
        include: {
            user: { select: { name: true, image: true, email: true } },
            categories: true,
            bookings: true,
            slots: {
                where: {
                    isBooked: false
                }
            },
            reviews: {
                include: {
                    student: {
                        select: {
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { averageRating: 'desc' }
    });
};

const getMyStudents = async (userId: string) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: userId }
    });

    if (!tutor) {
        return [];
    }

    const result = await prisma.booking.findMany({
        where: {
            tutorId: tutor.id,
            status: {
                not: 'CANCELLED' // Jader status CANCELLED na, sudhu tader e dekhabe
            }
        },
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return result;
};

export const TutorService = { createOrUpdateProfile, getMyStudents, updateAvailability, getAllTutors };