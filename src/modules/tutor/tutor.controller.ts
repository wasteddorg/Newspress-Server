

import { Request, Response } from "express";
import { TutorService } from "./tutor.service";

const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await TutorService.createOrUpdateProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: "Tutor profile processed successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateAvailability = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const result = await TutorService.updateAvailability(userId, req.body.slots);
        res.status(200).json({ success: true, message: "Slots added!", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllTutors = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getAllTutors(req.query);
        res.status(200).json({ success: true, message: "Tutors fetched!", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyStudents = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await TutorService.getMyStudents(userId);

        res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const TutorController = { updateProfile, getMyStudents, updateAvailability, getAllTutors };