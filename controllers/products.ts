import prisma from "../database/prismaClient";
import { Request, Response } from "express";

export const getAllProductsController = async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                deletedAt: null
            }
        })
        res.status(200).json({
            msg: "Berhasil mendapatkan semua produk",
            data: product,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findFirst({
            where: {
                id: String(id),
            },
        })
        if (!product){
            return res.status(404).json({
                msg: "Produk tidak ditemukan"
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan data produk",
            data: product,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const createProductController = async (req: Request, res: Response) => {
    try {
        const { name, description, price, stock, categoryId } = req.body;
        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
            }
        })
        if(existingProduct){
            return res.status(400).json({
                msg: "Produk sudah ada",
            })
        }
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
            }
        })
        res.status(201).json({
            msg: "Berhasil membuat produk",
            data: newProduct,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}