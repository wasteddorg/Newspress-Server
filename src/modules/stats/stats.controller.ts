import { Request, Response } from "express";
import { StatsService } from "./stats.service";

const getStudentStats = async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).user;
        const result = await StatsService.getStudentStats(id);

        res.status(200).json({
            success: true,
            message: "Student statistics retrieved successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTutorStats = async (req: Request, res: Response) => {
    try {
        console.log("User from request:", (req as any).user);
        const { id } = (req as any).user;
        const result = await StatsService.getTutorStats(id);

        res.status(200).json({
            success: true,
            message: "Tutor statistics retrieved successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const StatsController = {
    getStudentStats,
    getTutorStats
}