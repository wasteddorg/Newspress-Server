import express from "express";
import { CategoryController } from "./category.controller.js";
import auth, { UserRole } from "../../middleware/auth.js";

const router = express.Router();

router.post(
    "/create-category",
    auth(UserRole.ADMIN),
    CategoryController.createCategory
);

router.get("/", CategoryController.getCategories);

router.patch(
    "/update-category/:id",
    auth(UserRole.ADMIN),
    CategoryController.updateCategory
);

router.delete(
    "/delete-category/:id",
    auth(UserRole.ADMIN),
    CategoryController.deleteCategory
);

export const CategoryRoutes: any = router;