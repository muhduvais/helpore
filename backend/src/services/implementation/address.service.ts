import { injectable, inject } from "tsyringe";
import { IAddressRepository } from "../../repositories/interfaces/IAddressRepository";
import { IAddressDocument } from "../../interfaces/address.interface";
import { ErrorMessages } from "../../constants/errorMessages";
import { IAddressService } from "../interfaces/IAddressService";
import { AddressDTO } from "../../dtos/address.dto";
import { toAddressDTO, toAddressListDTO } from "../../mappers/address.mapper";

@injectable()
export class AddressService implements IAddressService {
  constructor(
    @inject("IAddressRepository")
    private readonly _addressRepository: IAddressRepository
  ) {}

  async addAddress(addressData: IAddressDocument): Promise<string | null> {
    try {
      const newAddress = await this._addressRepository.addAddress(addressData);
      return String(newAddress._id);
    } catch (error) {
      console.error(ErrorMessages.ADDRESS_CREATE_FAILED, error);
      return null;
    }
  }

  async fetchAddresses(userId: string): Promise<AddressDTO[] | null> {
    try {
      const addresses = await this._addressRepository.findAddressesByEntityId(userId);
      if (!addresses) {
        throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
      }
      return toAddressListDTO(addresses);
    } catch (error) {
      console.error(ErrorMessages.ADDRESS_FETCH_FAILED, error);
      return null;
    }
  }

  async fetchAddress(userId: string): Promise<AddressDTO | null> {
    try {
      const address = await this._addressRepository.findAddressByEntityId(userId);
      if (!address) {
        throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
      }
      return toAddressDTO(address);
    } catch (error) {
      console.error(ErrorMessages.ADDRESS_FETCH_FAILED, error);
      return null;
    }
  }
}
