import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../interfaces/auth.interface';
import User from '../models/user.model';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Access token is missing!' });
            return;
        }

        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                console.error('Access token expired:', err);
                res.status(401).json({ message: 'Token expired!' });
                return;
            }
            console.error('Invalid token:', err);
            res.status(403).json({ message: 'Token is invalid!' });
            return;
        }

        req.user = decoded;

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ isBlocked: true, message: 'Your account has been blocked!' });
            return;
        }

        next();
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

export const authorizeRole = (requiredRole: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                res.status(403).json({ message: 'User not authenticated!' });
                return;
            }

            if (!requiredRole.includes(req.user.role)) {
                res.status(403).json({ message: `Access denied! ${requiredRole} role is required.` });
                return;
            }

            next();
        } catch (error) {
            console.error('Role authorization error:', error);
            res.status(500).json({ message: 'Internal server error!' });
        }
    };
};
