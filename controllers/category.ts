import prisma from "../database/prismaClient";
import { Request, Response } from "express";

export const getAllCategoriesController = async (req: Request, res: Response) => {
    try {
        const category = await prisma.category.findMany({
            where: {
                deletedAt: null
            },
        });
        res.status(200).json({
            msg: "Berhasil mendapatkan semua Kategori",
            data: category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const getCategoriesByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findFirst({
            where: {
                id: String(id),
            }
        })
        if(!category){
            return res.status(404).json({
                msg: "Kategori tidak ditemukan",
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan data kategori",
            data: category
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}