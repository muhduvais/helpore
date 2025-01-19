import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
dotenv.config();

export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('An error occured: ', err.message);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error!',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    })
}