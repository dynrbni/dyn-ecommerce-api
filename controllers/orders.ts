import prisma from "../database/prismaClient";
import { Response } from "express";
import { AuthRequest } from "../types/express";

export const getAllUsersOrdersController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const orders = await prisma.order.findMany({
            where: {
                userId: userId
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
            msg: "Berhasil mendapatkan data orders",
            data: {
                orders: orders.map(order => ({
                    orderId: order.id,
                    totalPrice: order.totalPrice,
                    items: order.items.map(item => ({
                        userId: order.userId,
                        productId: item.productId,
                        productName: item.product.name,
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                    }))
                }))
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const checkoutFromCartController = async (req: AuthRequest, res: Response) => {
    try {
        const { cartItemId } = req.body;
        if (!cartItemId){
            return res.status(400).json({
                msg: "Cart Item ID harus diisi",
            })
        }
        const existingCart = await prisma.cart.findFirst({
            where: {
                userId: req.user!.id,
            }
        })
        if(!existingCart){
            return res.status(404).json({
                msg: "Keranjang tidak ditemukan",
            })
        }
        const selectedCartItem = await prisma.cartItem.findMany({
            where: {
                id: {in : cartItemId},
                cartId: existingCart.id,
            },
            include: {
                product: true,
            }
        })
        if(!selectedCartItem.length){
            return res.status(404).json({
                msg: "Cart Item tidak ditemukan",
            })
        }
        let totalPrice = 0;
        selectedCartItem.forEach(item => {
            totalPrice += item.product.price * item.quantity;
        })
        const order = await prisma.$transaction(async (tx) => {
            const createOrder = await tx.order.create({
                data: {
                    userId: req.user!.id,
                    totalPrice,
                    items:{
                        create: selectedCartItem.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceSnapshot: item.product.price,
                        }))
                    }
                },
                include: {
                    items: true,
                }
            })
            const item = selectedCartItem[0];
            await tx.product.update({
                where: {
                    id: item.productId,
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    }
                }
            })
            if (!selectedCartItem.length){
                throw new Error("Item tidak di temukan");
            }
            await tx.cartItem.deleteMany({
                where: {
                    id: String(cartItemId),
                    cartId: existingCart.id,
                }
            })
            return createOrder;
        })
        res.status(201).json({
            msg: "Berhasil checkout produk",
            data: {
                orderId: order.id,
                totalPrice: order.totalPrice,
                items: order.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceSnapshot: item.priceSnapshot,
                }))
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}