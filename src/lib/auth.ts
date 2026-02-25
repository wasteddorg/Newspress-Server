import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
      sessionData: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://newspress-client-flame.vercel.app",
  ],
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      status: { type: "string", required: false, defaultValue: "ACTIVE" },
      role: { type: "string", required: false, defaultValue: "USER" }, // <--- add this
    },
  },
});
