import express from "express";
import { UserController } from "./users.controller";
import auth, { UserRole } from "../../middleware/auth";


const router = express.Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);

router.patch("/update-role/:id", auth(UserRole.ADMIN), UserController.updateUserRole);

export const UserRoutes: any = router;