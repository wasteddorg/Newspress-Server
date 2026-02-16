import express, { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { CategoryController } from "./category.controller";

const router = express.Router();




router.post(
    "/create-category",
    auth(UserRole.ADMIN),
    CategoryController.createCategory
);

router.get(
    "/",
    // auth(UserRole.ADMIN),
    CategoryController.getAllCategories
);

router.patch(
    "/categories/:id",
    auth(UserRole.ADMIN),
    CategoryController.editCategory
);

router.delete(
    "/categories/:id",
    auth(UserRole.ADMIN),
    CategoryController.removeCategory
);



export const CategoryRoutes: Router = router;