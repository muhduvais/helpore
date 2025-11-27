import { AssetDTO } from "../../dtos/asset.dto";
import { AddAssetRequestDTO } from "../../dtos/requests/addAsset-request.dto";
import { IAsset } from "../../interfaces/asset.interface";
import { IBaseRepository } from "./IBaseRepository";

export interface IAssetRepository extends IBaseRepository<IAsset> {
  findAssets(query: object, skip: number, limit: number, sortQuery: { [key: string]: 1 | -1 }): Promise<IAsset[] | null>;
  findAssetDetails(assetId: string): Promise<IAsset | null>;
  addAsset(assetData: AddAssetRequestDTO): Promise<IAsset>;
  countAssets(query: object): Promise<number>;
  updateStock(assetId: string, quantity: number): Promise<boolean>;
  updateById(assetId: string, submitData: object): Promise<IAsset | null>;
}