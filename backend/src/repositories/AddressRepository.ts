import { injectable } from "tsyringe";
import { IAddress, IAddressDocument } from "../interfaces/userInterface";
import Address from "../models/addressModel";
import { IAddressRepository } from "./interfaces/IAddressRepository";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class AddressRepository extends BaseRepository<IAddressDocument> implements IAddressRepository {
  constructor() {
    super(Address);
  }

  async addAddress(addressData: IAddress): Promise<IAddressDocument> {
    return await this.create(addressData);
  }

  async findAddressesByEntityId(entityId: string): Promise<IAddressDocument[]> {
    try {
      return await Address.find({ entity: entityId }).exec();
    } catch (error) {
      console.error("Error finding addresses:", error);
      throw error;
    }
  }

  async findAddressesByQuery(query: object): Promise<IAddressDocument> {
    try {
      return await Address.findOne(query).exec();
    } catch (error) {
      console.error("Error finding address:", error);
      throw error;
    }
  }

  async findAddressByEntityId(entityId: string): Promise<IAddressDocument | null> {
    try {
      return await Address.findOne({ entity: entityId }).exec();
    } catch (error) {
      console.error("Error finding address by entity:", error);
      throw error;
    }
  }

  async updateAddress(entityId: string, submitData: IAddress): Promise<IAddressDocument | null> {
    try {
      return await Address.findOneAndUpdate({ entity: entityId }, { $set: submitData }, { new: true }).exec();
    } catch (error) {
      console.error("Error updating the address:", error);
      return null;
    }
  }
}
