import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    baseURL: process.env.BETTER_AUTH_URL,

    trustedOrigins: [
        "http://localhost:3000"
    ],


    emailAndPassword: {
        enabled: true,
    },

    user: {
        additionalFields: {
            role: { type: "string", required: false, defaultValue: "USER" },
            status: { type: "string", required: false, defaultValue: "ACTIVE" },
        },
    },


});