import express, { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { TutorController } from "./tutor.controller";

const router = express.Router();

router.put(
    "/profile",
    auth(UserRole.TUTOR),
    TutorController.updateProfile
);

router.put(
    "/availability",
    auth(UserRole.TUTOR),
    TutorController.updateAvailability
);

router.get("/",
    TutorController.getAllTutors
);


router.get(
  '/my-students',
  auth(UserRole.TUTOR), 
  TutorController.getMyStudents
);





export const TutorRoutes: Router = router;



