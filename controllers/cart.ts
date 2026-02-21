import prisma from "../database/prismaClient";
import { Response } from "express";
import { AuthRequest } from "../types/express";

export const getUserCartController = async (req: AuthRequest, res: Response) => {
    try {
        const existingCart = await prisma.cart.findFirst({
            where:{
                userId: String(req.user!.id),
            }
        })
        if(!existingCart){
            return res.status(404).json({
                msg: "Keranjang tidak ditemukan",
            })
        }
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cartId: existingCart.id,
            },
            include: {
                product: true,
            }
        })
        res.status(200).json({
            msg: "Berhasil mendapatkan data keranjang",
            idCart: existingCart.id,
            data: {
                items: cartItems.map((item) => ({
                    cartItemId: item.id,
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    totalPrice: item.product.price * item.quantity,
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

export const getItemCartByIdController = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const existingCart = await prisma.cart.findFirst({
            where: {
                userId: String(req.user!.id),
            },
        })
        if (!existingCart){
            return res.status(404).json({
                msg: "Keranjang tidak ditemukan"
            })
        }
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: existingCart.id,
                id: String(id),
            },
            include: {
                product: true,
            }
        })
        if (!cartItem){
            return res.status(404).json({
                msg: "Item keranjang tidak ditemukan"
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan item keranjang",
            idCart: existingCart.id,
            data: {
                cartItemId: cartItem.id,
                productId: cartItem.productId,
                productName: cartItem.product.name,
                quantity: cartItem.quantity,
                totalPrice: cartItem.product.price * cartItem.quantity,
            },
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const addToCartController = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({
                msg: "Product ID dan Quantity harus diisi",
            })
        }
        if (quantity <= 0){
            return res.status(400).json({
                msg: "Quantity harus lebih besar dari 0",
            })
        }
        const productNotFound = await prisma.product.findFirst({
            where: {
                id: (productId),
            }
        })
        if (!productNotFound){
            return res.status(404).json({
                msg: "Produk tidak ditemukan",
            })
        }
        //cek user udh punya cart tw blm
        let existingCart = await prisma.cart.findUnique({
            where: {
                userId: req.user!.id,
            }
        })  
        //buat cart baru
        if(!existingCart){
            existingCart = await prisma.cart.create({
                data: {
                    userId: req.user!.id,
                }
            })
        }
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: existingCart!.id,
                productId: String(productId),
            }
        })
        let updatedCartItem;
        if (existingItem){
            updatedCartItem = await prisma.cartItem.update({
                where: {
                    id: existingItem.id,
                },
                data: {
                    quantity: existingItem.quantity + quantity,
                },
                include: {
                    product: true,
                }
            })
        } else {
            updatedCartItem = await prisma.cartItem.create({
                data: {
                    cartId: existingCart!.id,
                    productId: (productId),
                    quantity,
                },
                include: {
                    product: true,
                }
            })
        }
        res.status(201).json({
            msg: "Berhasil menambahkan produk ke keranjang",
            data: {
                cartItemId: updatedCartItem.id,
                productId: updatedCartItem.product.id,
                productName: updatedCartItem.product.name,
                quantity: updatedCartItem.quantity,
                totalPrice: updatedCartItem.product.price * updatedCartItem.quantity,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const updateCartController = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({
                msg: "Product ID dan Quantity harus diisi",
            })
        }
        if (quantity <= 0){
            return res.status(400).json({
                msg: "Quantity tidak boleh kosong",
            })
        }
        const productNotFound = await prisma.product.findFirst({
            where: {
                id: (productId),
            }
        })
        if (!productNotFound){
            return res.status(404).json({
                msg: "Produk tidak ditemukan",
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
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: existingCart.id,
                productId: String(productId),
            }
        })
        if (!existingItem){
            return res.status(404).json({
                msg: "Produk tidak ditemukan di keranjang",
            })
        }
        const updatedCartItem = await prisma.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity,
            },
            include: {
                product: true,
            }
        })
        res.status(200).json({
            msg: "Berhasil memperbarui produk di keranjang",
            data: {
                productId: updatedCartItem.product.id,
                productName: updatedCartItem.product.name,
                quantity: updatedCartItem.quantity,
                totalPrice: updatedCartItem.product.price * updatedCartItem.quantity,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}

export const removeItemCartController = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.body;
        if(!productId){
            return res.status(400).json({
                msg: "Product ID harus diisi",
            })
        }
        const existingCart = await prisma.cart.findUnique({
            where: {
                userId: req.user!.id,
            }
        })
        if (!existingCart){
            return res.status(404).json({
                msg: "Keranjang tidak ditemukan"
            })
        }
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: existingCart.id,
                productId: String(productId),
            }
        })
        if (!existingItem){
            return res.status(404).json({
                msg: "Produk tidak ditemukan di keranjang",
            })
        }
        await prisma.cartItem.delete({
            where: {
                id: existingItem.id,
            }
        })
        res.status(200).json({
            msg: "Berhasil menghapus produk dari keranjang",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error",
        })
    }
}