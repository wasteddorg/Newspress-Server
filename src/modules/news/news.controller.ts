import { Request, Response } from "express";
import { NewsService } from "./news.service.js";

const createNews = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found in request"
            });
        }

        const result = await NewsService.createNews(req.body, user.id);
        res.status(201).json({
            success: true,
            message: "News created successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllNews = async (req: Request, res: Response) => {
    try {
        const result = await NewsService.getAllNews();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSingleNews = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;

        if (!slug) {
            return res.status(400).json({ success: false, message: "Slug is required" });
        }

        const result = await NewsService.getNewsBySlug(slug);

        if (!result) {
            return res.status(404).json({ success: false, message: "News not found" });
        }

        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateNews = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ success: false, message: "News ID is required" });
        }

        const result = await NewsService.updateNews(id, req.body);
        res.status(200).json({
            success: true,
            message: "News updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNews = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ success: false, message: "News ID is required" });
        }

        await NewsService.deleteNews(id);
        res.status(200).json({ success: true, message: "News deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const NewsController = {
    createNews,
    getAllNews,
    getSingleNews,
    updateNews,
    deleteNews,
};