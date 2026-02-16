import express from "express";
import { CategoryController } from "./category.controller.js";
import auth, { UserRole } from "../../middleware/auth.js";

const router = express.Router();

router.post(
    "/create-category",
    auth(UserRole.ADMIN),
    CategoryController.createCategory)
;
router.get("/", CategoryController.getCategories);

export const CategoryRoutes: any = router;