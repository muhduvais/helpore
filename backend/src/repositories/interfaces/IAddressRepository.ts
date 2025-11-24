import { IAddress, IAddressDocument } from "../../interfaces/address.interface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAddressRepository extends IBaseRepository<IAddressDocument> {
  findAddressesByEntityId(entityId: string): Promise<IAddressDocument[]>;
  findAddressByEntityId(entityId: string): Promise<IAddressDocument | null>;
  findAddressesByQuery(query: object): Promise<IAddressDocument | null>;
  addAddress(addressData: IAddress): Promise<IAddressDocument>;
  updateAddress(entityId: string, submitData: Partial<IAddress>): Promise<IAddressDocument | null>;
}