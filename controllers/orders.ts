import { ulid } from './../node_modules/zod/src/v4/core/regexes';
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
                    status: order.status,
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

export const getOrderByIdController = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const order = await prisma.order.findUnique({
            where: {
                id: String(id),
            },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                }
            }
        })
        if (!order || order.userId !== userId){
            return res.status(404).json({
                msg: "Order tidak ditemukan",
            })
        }
        if (!order){
            return res.status(404).json({
                msg: "Order tidak ditemukan",
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan data order",
            data: {
                orderId: order.id,
                totalPrice: order.totalPrice,
                status: order.status,
                items: order.items.map(item => ({
                    userId: order.userId,
                    productId: item.productId,
                    productName: item.product.name,
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

export const checkoutFromCartController = async (req: AuthRequest, res: Response) => {
    try {
        const { cartItemId } = req.body;
        if (!cartItemId){
            return res.status(400).json({
                msg: "Cart Item ID harus diisi",
            })
        }
        const existingCart = await prisma.cart.findUnique({
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
                msg: "Produk tidak ditemukan",
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
            for (const item of selectedCartItem){
                const product = await tx.product.findUnique({
                    where: {
                        id: item.productId,
                    }
                })
                if (!product){
                    throw new Error(`Produk tidak ditemukan`)
                }
               const update = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        }
                    }
                })
                if (update.count === 0){
                    throw new Error(`Stok produk ${product.name} tidak cukup`)
                 }
                await tx.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        stock:{
                            decrement: item.quantity,
                        },
                    }
                })
            }
            await tx.cartItem.deleteMany({
                where: {
                    id: {in: cartItemId},
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

export const checkoutNowController = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity){
            return res.status(400).json({
                msg: "Product ID dan quantity harus diisi",
            })
        }
        if (quantity <= 0){
            return res.status(400).json({
                msg: "Quantity harus lebih dari 0",
            })
        }
        const product = await prisma.product.findUnique({
            where: {
                id: String(productId),
            }
        })
        if (!product || product.deletedAt !== null){
            return res.status(404).json({
                msg: "Produk tidak ditemukan",
            })
        }

        const order = await prisma.$transaction(async (tx) => {
            const update = await tx.product.updateMany({
                where: {
                    id: String(productId),
                    deletedAt: null,
                    stock: {
                        gte: quantity,
                    }
                },
                data: {
                    stock: {
                        decrement: quantity,
                    }
                }
            })
            if (update.count === 0){
                throw new Error("Stok produk tidak cukup");
             }
            const createorder = await tx.order.create({
                data: {
                    userId: req.user!.id,
                    totalPrice: product.price * quantity,
                    items: {
                        create: {
                            productId: product.id,
                            quantity,
                            priceSnapshot: product.price,
                        }
                    }
                },
                include: {
                    items: true,
                }
            })
            await tx.product.update({
                where: {
                    id: String(productId),
                },
                data: {
                    stock: {
                        decrement: quantity,
                 }
                },
            })
            return createorder;
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