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

export const createCategoryController = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const existingCategory = await prisma.category.findFirst({
            where:{
                name,
            }
        })
        if (existingCategory){
            return res.status(400).json({
                msg: "Kategori sudah ada",
            })
        }
        const category = await prisma.category.create({
            data: {
                name,
            }
        })
        res.status(201).json({
            msg: "Berhasil membuat kategori",
            data: category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const updateCategoryController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const categoryNotFound = await prisma.category.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!categoryNotFound){
            return res.status(404).json({
                msg: "Kategori tidak ditemukan",
            })
        }
        const updatedCategory = await prisma.category.update({
            where: {
                id: String(id),
            },
            data: {
                name,
            }
        })
        res.status(200).json({
            msg: "Berhasil mengupdate kategori",
            data: updatedCategory,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const deleteCategoryController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoryNotFound = await prisma.category.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!categoryNotFound){
            return res.status(404).json({
                msg: "Kategori tidak ditemukan",
            })
        }
        const deletedCategory = await prisma.category.update({
            where: {
                id: String(id),
            },
            data: {
                deletedAt: new Date(),
            }
        })
        res.status(200).json({
            msg: "Berhasil menghapus kategori",
            data: deletedCategory,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}