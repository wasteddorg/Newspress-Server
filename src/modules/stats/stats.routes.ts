import express, { Router } from "express";
import { StatsController } from "./stats.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
    "/student-stats",
    auth(UserRole.STUDENT),
    StatsController.getStudentStats
);

router.get(
    "/tutor-stats",
    auth(UserRole.TUTOR),
    StatsController.getTutorStats
);

export const StatsRoutes: Router = router;