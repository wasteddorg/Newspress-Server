import { Request, Response } from "express";
import { StatsService } from "./stats.service";

const getStatsSummary = async (req: Request, res: Response) => {
    try {
        const stats = await StatsService.getAdminStats();
        res.status(200).json({
            success: true,
            data: stats
        });
  } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const StatsController = {
    getStatsSummary,
};