import { IAsset } from "../../interfaces/userInterface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAssetRepository extends IBaseRepository<IAsset> {
  findAssets(query: object, skip: number, limit: number): Promise<IAsset[]>;
  findAssetDetails(assetId: string): Promise<IAsset>;
  addAsset(assetData: IAsset): Promise<IAsset>;
  countAssets(query: object): Promise<number>;
  updateStock(assetId: string, quantity: number): Promise<boolean>;
  updateById(assetId: string, submitData: object): Promise<IAsset>;
}