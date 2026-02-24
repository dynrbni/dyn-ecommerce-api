import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface jwtPayload{
    id: string;
    role: Role;
}

export const generateToken = (payload: jwtPayload): string => {
    const secretKey = process.env.JWT_SECRET as string;
    return jwt.sign(payload, secretKey, { expiresIn: '1d' });
}