import { Request, Response } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
    try {
        const studentId = req.user!.id;
        const { tutorId, slotId } = req.body;
        const result = await BookingService.createBooking(studentId, tutorId, slotId);

        res.status(201).json({
            success: true,
            message: "Booking confirmed successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const role = req.user!.role;
        const result = await BookingService.getMyBookings(userId, role);

        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await BookingService.getBookingById(id);

        if (!result) {
            return res.status(404).json({ success: false, message: "Booking not found!" });
        }

        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user!.id;

        const result = await BookingService.updateBookingStatus(id, userId, status);

        res.status(200).json({
            success: true,
            message: `Booking has been ${status.toLowerCase()} successfully!`,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const BookingController = { createBooking, getMyBookings, updateBookingStatus, getBookingById };