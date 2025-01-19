import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../interfaces/authInterface';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Access token is missing!' });
            return;
        }

        console.log('Token from middleware:', token);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
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

            console.log('Decoded token payload:', decoded);
            req.user = decoded as JwtPayload;
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

            console.log('req.user: ', user);

            if (!user) {
                res.status(403).json({ message: 'User not authenticated!' });
                return;
            }

            const { role } = user;

            if (role !== requiredRole) {
                res.status(403).json({ message: `Access denied! ${requiredRole} role is required.` });
                return;
            }

            console.log(`User role '${role}' authorized for this route.`);
            next();
        } catch (error) {
            console.error('Role authorization error:', error);
            res.status(500).json({ message: 'Internal server error!' });
        }
    };
};
