import express from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            userId: string;
            role: string;
            iat?: number;
            exp?: number;
        };
    }
}