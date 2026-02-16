import express, { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { BookingController } from "./booking.controller";

const router = express.Router();

router.post("/", auth(UserRole.STUDENT), BookingController.createBooking);

router.get("/my-bookings", auth(UserRole.STUDENT, UserRole.TUTOR), BookingController.getMyBookings);

router.get("/:id", auth(UserRole.STUDENT, UserRole.TUTOR), BookingController.getBookingById);

router.patch("/:id/status", auth(UserRole.STUDENT, UserRole.TUTOR), BookingController.updateBookingStatus);

export const BookingRoutes: Router = router;