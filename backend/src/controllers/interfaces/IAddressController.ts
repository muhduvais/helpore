import { Request, Response } from 'express';

export interface IAddressController {
    createAddress (req: Request, res: Response): Promise<void>;
    getAddresses (req: Request, res: Response): Promise<void>
}