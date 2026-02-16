import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    baseURL: process.env.BETTER_AUTH_URL,

    // ১. এখানে প্রডাকশন লিঙ্কটি সবার আগে রাখুন
    trustedOrigins: [
        "https://skill-bridge-client-eight.vercel.app",
        "http://localhost:3000"
    ],

    // ২. কুকি সেকশনে ক্রস-সাইট সাপোর্ট নিশ্চিত করা
    advanced: {
        useSecureCookies: true, // প্রডাকশনে এটি বাধ্যতামূলক
    },

    cookie: {
        sameSite: "none", // ক্রস-সাইট কুকির জন্য
        secure: true,     // HTTPS এর জন্য
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // ১ সপ্তাহ
    },

    // ৩. সেশন সেটিংস (এটি আপনার সেশন ম্যানেজমেন্টকে আরও শক্ত করবে)
    session: {
        expiresIn: 60 * 60 * 24 * 7, // সেশন ৭ দিন স্থায়ী হবে
        updateAge: 60 * 60 * 24,    // প্রতিদিন সেশন আপডেট হবে
    },

    emailAndPassword: {
        enabled: true,
    },

    user: {
        additionalFields: {
            role: { type: "string", required: false, defaultValue: "STUDENT" },
            status: { type: "string", required: false, defaultValue: "ACTIVE" },
        },
    },

    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const user = await prisma.user.findUnique({
                        where: { id: session.userId }
                    });
                    if (user && user.status === "BLOCKED") {
                        throw new Error("BANNED_USER");
                    }
                }
            }
        }
    }
});