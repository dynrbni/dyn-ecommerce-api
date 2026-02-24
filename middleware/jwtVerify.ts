import type { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export const JwtVerify = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({   
            status: false,
            msg: "Unauthorized - token missing",
        });
    }

    jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({
                status: false,
                msg: "Unauthorized - invalid token",
            });
        }
        req.user = { 
            id: decoded.id,
            role: decoded.role,
        };
        next();
    });
};