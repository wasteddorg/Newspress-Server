import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
    try {
        const studentId = req.user!.id;
        const { tutorId, bookingId, rating, comment } = req.body;

        const result = await ReviewService.createReview(
            studentId,
            tutorId,
            bookingId,
            rating,
            comment
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const ReviewController = { createReview };