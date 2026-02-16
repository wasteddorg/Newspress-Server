import { Request, Response } from "express";
import { CategoryService } from "./category.service.js";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await CategoryService.createCategory(name);
    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const CategoryController = {
  createCategory,
  getCategories
};