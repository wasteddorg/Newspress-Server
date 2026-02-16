import express, { Router } from "express";
import { ReviewController } from "./review.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.post("/", auth(UserRole.STUDENT), ReviewController.createReview);

export const ReviewRoutes: Router = router;