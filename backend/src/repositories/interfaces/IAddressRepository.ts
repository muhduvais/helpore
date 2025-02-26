import { IAddress, IAddressDocument } from "../../interfaces/userInterface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAddressRepository extends IBaseRepository<IAddressDocument> {
  findAddressesByEntityId(entityId: string): Promise<IAddressDocument[]>;
  findAddressByEntityId(entityId: string): Promise<IAddressDocument | null>;
  findAddressesByQuery(query: object): Promise<IAddressDocument>;
  addAddress(addressData: IAddress): Promise<IAddressDocument>;
  updateAddress(entityId: string, submitData: IAddress): Promise<IAddressDocument | null>;
}