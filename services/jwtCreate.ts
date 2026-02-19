import jwt from 'jsonwebtoken';

export const generateToken = (payload: object): string => {
    const secretKey = process.env.JWT_SECRET as string;
    return jwt.sign(payload, secretKey, { expiresIn: '1d' });
}