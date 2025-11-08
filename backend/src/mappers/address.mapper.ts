import { plainToInstance } from "class-transformer"
import { IAddressDocument } from "../interfaces/address.interface"
import { AddressDTO } from "../dtos/address.dto";

export const toAddressDTO = (address: IAddressDocument): AddressDTO => {
    return plainToInstance(AddressDTO, {
        id: address._id,
        fname: address.fname,
        lname: address.lname,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        entity: address.entity,
        type: address.type,
    });
}

export const toAddressListDTO = (addresses: IAddressDocument[]): AddressDTO[] => {
    return addresses.map((address) => toAddressDTO(address));
}