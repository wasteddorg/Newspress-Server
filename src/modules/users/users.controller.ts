import { Request, Response } from "express";
import { UserService } from "./users.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const result = await UserService.updateUserRoleInDB(id, role);
        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const UserController = {
    getAllUsers,
    updateUserRole
};