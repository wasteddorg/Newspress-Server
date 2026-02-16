import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
                email: string;
                name: string;
                role: UserRole;
                emailVerified: boolean;
                image: string | null | undefined;
            }
        }
    }
}

const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await betterAuth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized! Please login first."
                });
            }

            const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as UserRole,
                emailVerified: session.user.emailVerified,
                image: session.user.image
            };

            if (roles.length > 0 && !roles.includes(userData.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden! Only ${roles.join(", ")} can access this resource.`
                });
            }

            req.user = userData;
            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during authentication",
            });
        }
    };
};

export default auth;