import prisma from "../database/prismaClient";
import { Response } from "express";
import { AuthRequest } from "../types/express";

export const getUserOrdersController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId){
            return res.status(401).json({
                msg: "Unauthorized",
            })
        }
        const orders = await prisma.order.findMany({
            where: {
                userId: String(userId),
            },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                }
            }
        })
        res.status(200).json({
            msg: "Berhasil mendapatkan orders user",
            data: orders,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const getOrdersByIdController = async (req: AuthRequest, res: Response) => {
    try {
        const orderId = req.params.id;
        const userId = req.user?.id;
        if (!userId){
            return res.status(401).json({
                msg: "Unauthorized",
            })
        }
        const order = await prisma.order.findUnique({
            where: {
                id: String(orderId),
            },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                }
            }
        })
        if (!order) {
            return res.status(404).json({
                msg: "Order tidak ditemukan",
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan order",
            data: order,
        })
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}