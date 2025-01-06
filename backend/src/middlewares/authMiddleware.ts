import jwt, {TokenExpiredError} from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        console.log('Token: ', token);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log('Access token verification error');
                if (err instanceof TokenExpiredError) {
                    console.log('Expired');
                    res.status(401).json({ message: 'Token expired!' });
                    return;
                }
                console.log('Invalid');
                res.status(403).json({ message: 'Token is invalid!' });
                return;
            }
            console.log('Access token verified successfully!');
            req.user = decoded;
            next();
        })
    } catch (error) {
        console.log('Internal server error', error);
        return;
    }
}