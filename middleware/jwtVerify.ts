import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export const JwtVerify = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({   
            status: false,
            message: "Unauthorized - token missing",
        });
    }

    jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized - invalid token",
            });
        }
        req.body.user = decoded;
        next();
    });
};