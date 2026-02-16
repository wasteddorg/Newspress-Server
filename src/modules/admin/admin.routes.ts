import express, { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get(
    "/users",
    auth(UserRole.ADMIN),
    AdminController.getAllUsers
);

router.patch(
    "/users/:id/status",
    auth(UserRole.ADMIN),
    AdminController.updateUserStatus
);

router.patch(
    "/users/:id/role",
    auth(UserRole.ADMIN),
    AdminController.updateUserRole
);

router.get(
    "/bookings",
    auth(UserRole.ADMIN),
    AdminController.getAllBookings
);

router.get(
    "/categories",
    auth(UserRole.ADMIN),
    AdminController.getCategories
);

router.post(
    "/categories",
    auth(UserRole.ADMIN),
    AdminController.addCategory
);

export const AdminRoutes: Router = router;