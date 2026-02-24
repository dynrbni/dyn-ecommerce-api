import prisma from "../database/prismaClient";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateToken } from "../services/jwtCreate";

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findMany({
            where: {
                deletedAt: null
            },
        });
        res.status(200).json({
            msg: "Berhasil mendapatkan semua users",
            data: user.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
            }))
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const getUserByIdController = async (req: Request, res: Response) =>{
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!user){
            return res.status(404).json({
                msg: "User tidak ditemukan",
            })
        }
        res.status(200).json({
            msg: "Berhasil mendapatkan data user",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const createUserController = async (req: Request, res: Response) => {
    try {
         const { name, email, password } = req.body;
         if (!name || !email || !password){
            return res.status(400).json({
                msg: "Semua fields wajib diisi"
            })
         }
         const hashedPassword = await bcrypt.hash(password, 10)
         const existingUser = await prisma.user.findUnique({
            where: {
                email,
            }
         })
         if (existingUser){
            return res.status(400).json({
                msg: "Email sudah terdaftar",
            })
         }
         const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
         })
         const token = generateToken({id: newUser.id, role: newUser.role});
         res.status(201).json({
            msg: "Berhasil membuat user baru",
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
            token: token,
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const loginUserController = async (req:Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password){
            return res.status(400).json({
                msg: "Email dan password wajib diisi"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                email,
                deletedAt: null,
            }
        })
        if (!user){
            return res.status(404).json({
                msg: "User tidak ditemukan",
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid){
            return res.status(401).json({
                msg: "Password Salah"
            })
        }
        const token = generateToken({id: user.id, role: user.role});
        res.status(200).json({
            msg: "Login berhasil!",
            hello: `Hey, Selamat datang kembali ${user.name} di E-Commerce!`,
            token: token,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const updateUserController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const userNotFound = await prisma.user.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!userNotFound){
            return res.status(404).json({
                msg: "User tidak ditemukan",
            })
        }

        const dataToUpdate: any = {};
            if (name !== undefined){
                dataToUpdate.name = name;
            }
            if (email !== undefined){
                dataToUpdate.email = email;
            }
            if (password !== undefined){
                dataToUpdate.password = await bcrypt.hash(password, 10);
            }
        const updatedUser = await prisma.user.update({
            where: {
                id: String(id),
            },
            data: dataToUpdate
        })
        res.status(200).json({
            msg: "Berhasil mengupdate user",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userNotFound = await prisma.user.findUnique({
            where: {
                id: String(id),
            }
        })
        if (!userNotFound){
            return res.status(404).json({
                msg: "User tidak ditemukan",
            })
        }
        const deletedUser = await prisma.user.update({
            where: {
                id: String(id),
            },
            data: {
                deletedAt: new Date(),
            }
        })
        res.status(200).json({
            msg: "Berhasil menghapus user",
            data: {
                id: deletedUser.id,
                name: deletedUser.name,
                email: deletedUser.email,
            },
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}