import prisma from "../database/prismaClient";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateToken } from "../services/jwtCreate";

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null
            },
        });
        res.status(200).json({
            msg: "Berhasil mendapatkan semua users",
            data: users,
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
        const user = await prisma.user.findFirst({
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
            data: user,
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
         const hashedPassword = await bcrypt.hash(password, 10)
         const existingUser = await prisma.user.findFirst({
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
         if (!name || !email || !password){
            return res.status(400).json({
                msg: "Semua fields wajib diisi"
            })
         }
         const token = generateToken({id: newUser.id});
         res.status(201).json({
            msg: "Berhasil membuat user baru",
            data: newUser,
            token: token,
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}