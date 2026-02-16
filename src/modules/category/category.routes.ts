import express from "express";
import { CategoryController } from "./category.controller.js";

const router = express.Router();

router.post("/create-category", CategoryController.createCategory);

export const CategoryRoutes:any = router;