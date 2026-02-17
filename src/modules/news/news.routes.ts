import express from "express";
import { NewsController } from "./news.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.post("/create-news", auth(UserRole.ADMIN), NewsController.createNews);
router.get("/", NewsController.getAllNews);
router.get("/:slug", NewsController.getSingleNews);
router.patch("/:id", NewsController.updateNews);
router.delete("/:id", NewsController.deleteNews);

export const NewsRoutes: any = router;