import { Request, Response } from "express";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
    try {
        const { subject } = req.body;

        if (!subject || subject.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid Input: Subject name is required.",
            });
        }

        const result = await CategoryService.createCategory(subject);

        return res.status(201).json({
            success: true,
            message: "Success: New subject category has been added.",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create category.",
        });
    }
};

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully!",
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


const editCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { subject } = req.body;

        if (!subject) {
            return res.status(400).json({ success: false, message: "Please provide a subject name!" });
        }

        const result = await CategoryService.updateCategoryInDB(id, subject);

        res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const removeCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CategoryService.deleteCategoryFromDB(id);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const CategoryController = {
    createCategory,
    getAllCategories,
    editCategory,
    removeCategory
};