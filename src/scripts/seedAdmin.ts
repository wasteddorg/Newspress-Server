import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
async function seedAdmin() {
    console.log("Seeding process start hocche...");

    const adminEmail = "admin2@gmail.com";
    const plainPassword = "admin1234";

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            console.log("User already exists. Skipping...");
            return;
        }

        await prisma.user.create({
            data: {
                name: "Admin shaheb",
                email: adminEmail,
                role: Role.ADMIN,
                emailVerified: true,
                accounts: {
                    create: {
                        providerId: "credential",
                        accountId: adminEmail,
                        password: plainPassword,
                    }
                }
            }
        });

        console.log("Admin and Account successfully created!");

    } catch (err) {
        console.error("Error dhora poreche:", err);
    } finally {
        await prisma.$disconnect();
        console.log("Seeding process finished.");
    }
}

seedAdmin();

