import { createTransaction } from '../services/midtrans';
import prisma from "../database/prismaClient";
import { Response } from "express";
import { AuthRequest } from "../types/express"; 
import { PaymentStatus } from '@prisma/client';

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
                    PaymentStatus: order.paymentStatus,
                    shippingStatus: order.shippingStatus,
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
                shippingStatus: order.shippingStatus,
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
                    paymentStatus: "PENDING",
                    shippingStatus: "NOT_SHIPPED",
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
            //midtrans
            const productName = selectedCartItem.map(item => item.product.name).join(", ");
            const transaction = await createTransaction(createOrder.id, totalPrice, productName);
           
            await tx.payment.create({
                data: {
                    orderId: createOrder.id,
                    midtransOrderId: createOrder.id,
                    transactionId: null,
                    transactionStatus: "PENDING",
                    grossAmount: totalPrice,
                    signatureKey: transaction.token
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
            }
            await tx.cartItem.deleteMany({
                where: {
                    id: {in: cartItemId},
                    cartId: existingCart.id,
                }
            })
            return { order: createOrder, transaction: transaction.redirect_url };
        })
        res.status(201).json({
            msg: "Berhasil checkout produk",
            data: {
                orderId: order.order.id,
                totalPrice: order.order.totalPrice,
                shippingStatus: order.order.shippingStatus,
                paymentUrl: order.transaction,
                items: order.order.items.map(item => ({
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
            const freshProduct = await tx.product.findUnique({
                where: {
                    id: String(productId),
                }
            })
            if (!freshProduct){
                throw new Error("Produk tidak ditemukan");
             }
            const order = await tx.order.create({
                data: {
                    userId: req.user!.id,
                    totalPrice: product.price * quantity,
                    shippingStatus: "NOT_SHIPPED",
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
              //midtrans
            const transaction = await createTransaction(order.id, order.totalPrice, product.name);

            await tx.payment.create({
                data: {
                    orderId: order.id,
                    midtransOrderId: order.id,
                    transactionId: null,
                    transactionStatus: "PENDING",
                    grossAmount: order.totalPrice,
                    signatureKey: transaction.token
                }
            })
            return { ...order, paymentUrl: transaction.redirect_url };
        })
        res.status(201).json({
            msg: "Berhasil checkout produk",
            data: {
                orderId: order.id,
                totalPrice: order.totalPrice,
                shippingStatus: order.shippingStatus,
                paymentUrl: order.paymentUrl,
                items: order.items.map(item => ({
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    priceSnapshot: item.priceSnapshot,
                }))
            }
        })
    } catch (error: any) {
       if (error.message === "Stok produk tidak cukup"){
            return res.status(400).json({
                msg: error.message,
             })
       }
       console.log(error);
        return res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}
