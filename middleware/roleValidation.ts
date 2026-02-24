import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/express';
import { Role } from '@prisma/client';

export const authorizeRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    next();
  };
};