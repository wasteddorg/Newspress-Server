// import { NextFunction, Request, Response } from "express";
// import { auth as betterAuth } from "../lib/auth";
// import { fromNodeHeaders } from "better-auth/node";

// export enum UserRole {
//     STUDENT = "STUDENT",
//     TUTOR = "TUTOR",
//     ADMIN = "ADMIN"
// }

// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 id: string;
//                 email: string;
//                 name: string;
//                 role: string;
//                 emailVerified: boolean
//             }
//         }
//     }
// }

// const auth = (...roles: UserRole[]) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const session = await betterAuth.api.getSession({
//                 headers: fromNodeHeaders(req.headers)
//             });

//             if (!session) {
//                 return res.status(401).json({
//                     success: false,
//                     message: "You are not authorized! Please login first."
//                 });
//             }



//             req.user = {
//                 id: session.user.id,
//                 email: session.user.email,
//                 name: session.user.name,
//                 role: session.user.role as string,
//                 emailVerified: session.user.emailVerified
//             };


//             if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
//                 return res.status(403).json({
//                     success: false,
//                     message: `Forbidden! Only ${roles.join(", ")} can access this resource.`
//                 });
//             }

//             next();

//         } catch (error) {
//             console.error("Auth Middleware Error:", error);
//             res.status(500).json({
//                 success: false,
//                 message: "Internal server error during authentication",
//             });
//         }
//     };
// };

// export default auth;



import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/prisma";

export enum UserRole {
    STUDENT = "STUDENT",
    TUTOR = "TUTOR",
    ADMIN = "ADMIN"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean
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

            const currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { status: true }
            });

            if (!currentUser || currentUser.status !== "ACTIVE") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is deactivated or blocked. Please contact admin."
                });
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            };

            if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden! Only ${roles.join(", ")} can access this resource.`
                });
            }

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