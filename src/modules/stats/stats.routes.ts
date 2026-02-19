import { Router } from "express";
import { StatsController } from "./stats.controller";
import auth, { UserRole } from "../../middleware/auth";

const router: any = Router();

router.get("/summary", auth(UserRole.ADMIN), StatsController.getStatsSummary);

export const StatsRoutes: any = router;

