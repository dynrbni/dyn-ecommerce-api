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
            },
            include:{
                category: true,
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

export const updateProductController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId } = req.body;
        const dataToUpdate: any = {};
        if (name !== undefined) 
            dataToUpdate.name = name;
        if (description !== undefined) 
            dataToUpdate.description = description;
        if (price !== undefined) 
            dataToUpdate.price = price;
        if (stock !== undefined) 
            dataToUpdate.stock = stock;
        if (categoryId !== undefined) 
            dataToUpdate.categoryId = categoryId;
        const updatedProduct = await prisma.product.update({
            where: {
                id: String(id),
            },
            data: dataToUpdate,
        })
        res.status(200).json({
            msg: "Berhasil mengupdate produk",
            data: updatedProduct,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const deleteProductController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productNotFound = await prisma.product.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!productNotFound){
            return res.status(404).json({
                msg: "Produk tidak ditemukan"
            })
        }
        const deletedProduct = await prisma.product.update({
            where: {
                id: String(id),
            },
            data: {
                deletedAt: new Date(),
            }
        })
        res.status(200).json({
            msg: "Berhasil menghapus produk",
            data: deletedProduct,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}