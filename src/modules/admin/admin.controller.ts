import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllUsers();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await AdminService.toggleUserStatus(id, status);
        res.status(200).json({
            success: true,
            message: `User is now ${status}`,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};


const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const result = await AdminService.updateUserRoleInDB(id, role);
        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllBookings = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllBookings();

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found in the system at the moment.",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "All bookings retrieved successfully for admin.",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching bookings.",
            error: error.message
        });
    }
};

const getCategories = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getAllCategoriesFromDB();
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const result = await AdminService.createCategoryInDB(name);
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};




export const AdminController = {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    getAllBookings,
    getCategories,
    addCategory,
   
};