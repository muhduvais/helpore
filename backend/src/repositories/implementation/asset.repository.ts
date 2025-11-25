import { injectable } from "tsyringe";
import { IAsset } from "../../interfaces/asset.interface";
import Asset from "../../models/asset.model";
import { IAssetRepository } from "../interfaces/IAssetRepository";
import { BaseRepository } from "./base.repository";
import { AddAssetRequestDTO } from "../../dtos/requests/addAsset-request.dto";

@injectable()
export class AssetRepository extends BaseRepository<IAsset> implements IAssetRepository {
  constructor() {
    super(Asset);
  }

  async addAsset(assetData: AddAssetRequestDTO): Promise<IAsset> {
    try {
      console.log('Asset data: ', assetData);
      const newAsset = new Asset(assetData);
      return await newAsset.save();
    } catch (error: any) {
      console.error("Mongoose save error:", error);
      throw new Error(`Error saving asset: ${error.message}`);
    }
  }

  async findAssets(query: object, skip: number, limit: number, sortQuery: { [key: string]: 1 | -1 }): Promise<IAsset[] | null> {
    try {
        return await Asset.find(query).skip(skip).limit(limit).sort(sortQuery);
    } catch (error: any) {
        console.error('Error finding the assets:', error);
        return null;
    }
}

  async findAssetDetails(assetId: string): Promise<IAsset | null> {
    try {
      return await Asset.findById(assetId);
    } catch (error: any) {
      console.error('Error finding the asset:', error);
      return null;
    }
  }

  async countAssets(query: object): Promise<number> {
    try {
      return await Asset.countDocuments(query);
    } catch (error: any) {
      console.error('Error counting assets:', error);
      return 0;
    }
  }

  async updateById(id: string, submitData: object): Promise<IAsset | null> {
    try {
      return await Asset.findByIdAndUpdate(id, submitData);
    } catch (error: any) {
      console.error('Error updating the asset:', error);
      return null;
    }
  }

  async updateStock(assetId: string, quantity: number): Promise<boolean> {
    try {
      await Asset.findByIdAndUpdate(assetId, { $inc: { stocks: -quantity } });
      return true;
    } catch (error: any) {
      console.error('Error updating stock:', error);
      return false;
    }
  }
}