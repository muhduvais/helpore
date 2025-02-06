import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../interfaces/authInterface';
import User from '../models/userModel';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Access token is missing!' });
            return;
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async (err, decoded) => {
            if (err) {
                if (err instanceof TokenExpiredError) {
                    console.error('Access token expired:', err);
                    res.status(401).json({ message: 'Token expired!' });
                    return;
                }
                console.error('Invalid token:', err);
                res.status(403).json({ message: 'Token is invalid!' });
                return;
            }

            const { userId } = decoded as JwtPayload;
            req.user = decoded as JwtPayload;

            const user = await User.findById(userId);

            if (!user) {
                res.status(404).json({ message: 'User not found!' });
                return;
            }

            if (user.isBlocked) {
                res.status(403).json({ isBlocked: true, message: 'Your account has been blocked!' });
                return;
            }
            
            next();
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};


export const authorizeRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const user = req.user as JwtPayload | undefined;

            if (!user) {
                res.status(403).json({ message: 'User not authenticated!' });
                return;
            }

            const { role } = user;

            if (role !== requiredRole) {
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
