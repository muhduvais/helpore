import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '../../services/interfaces/ServiceInterface';
import { IAddressController } from '../interfaces/IAddressController';
import { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';

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
                res.status(HttpStatusCode.OK).json({ success: true, addressId });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.CREATE_FAILED });
            }
        } catch (error) {
            console.error(ErrorMessages.CREATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.CREATE_FAILED, error });
        }
    }

    async getAddresses (req: Request, res: Response): Promise<void> {
        const { userId } = req.user as JwtPayload;
        try {
            const addresses = await this.userService.fetchAddresses(userId);
            if (addresses) {
                res.status(HttpStatusCode.OK).json({ success: true, addresses });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ADDRESS_NOT_FOUND });
            }
        } catch (error) {
            console.error(ErrorMessages.SERVER_ERROR, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.SERVER_ERROR, error });
        }
    }
}