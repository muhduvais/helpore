import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '../../services/interfaces/ServiceInterface';
import { IAddressController } from '../interfaces/IAddressController';

@injectable()
export class AddressController implements IAddressController {
    constructor(
        @inject('IUserService') private readonly userService: IUserService,
    ) {
        this.createAddress = this.createAddress.bind(this);
        this.getAddresses = this.getAddresses.bind(this);
    }

    async createAddress (req: Request, res: Response): Promise<void> {
        const entity = req.user?.userId;
        
        const type = 'user';
        const { addressData } = req.body;
        addressData.entity = entity;
        addressData.type = type;

        try {
            const addressId = await this.userService.addAddress(addressData);
            if (addressId) {
                res.status(200).json({ success: true, addressId });
            } else {
                res.status(400).json({ success: false, message: 'Error creating the address!' });
            }
        } catch (error) {
            console.error('Error creating the address:', error);
            res.status(500).json({ message: 'Error creating the address', error });
        }
    }

    async getAddresses (req: Request, res: Response): Promise<void> {
        const userId = req.user?.userId;
        try {
            const addresses = await this.userService.fetchAddresses(userId);
            if (addresses) {
                res.status(200).json({ success: true, addresses });
            } else {
                res.status(400).json({ success: false, message: 'Addresses not found!' });
            }
        } catch (error) {
            console.error('Error fetching the addresses:', error);
            res.status(500).json({ message: 'Error fetching the addresses', error });
        }
    }
}