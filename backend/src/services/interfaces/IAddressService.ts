import { AddressDTO } from "../../dtos/address.dto";
import { IAddressDocument } from "../../interfaces/address.interface";

export interface IAddressService {
    addAddress(addressData: IAddressDocument): Promise<string | null>;
    fetchAddresses(userId: string): Promise<AddressDTO[] | null>;
    fetchAddress(userId: string): Promise<AddressDTO | null>;
}