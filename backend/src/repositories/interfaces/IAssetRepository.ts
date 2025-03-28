import { IAsset } from "../../interfaces/user.interface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAssetRepository extends IBaseRepository<IAsset> {
  findAssets(query: object, skip: number, limit: number, sortQuery: { [key: string]: 1 | -1 }): Promise<IAsset[] | null>;
  findAssetDetails(assetId: string): Promise<IAsset | null>;
  addAsset(assetData: IAsset): Promise<IAsset>;
  countAssets(query: object): Promise<number>;
  updateStock(assetId: string, quantity: number): Promise<boolean>;
  updateById(assetId: string, submitData: object): Promise<IAsset | null>;
}