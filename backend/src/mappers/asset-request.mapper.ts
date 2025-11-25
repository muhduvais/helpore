import { AddAssetRequestDTO } from "../dtos/requests/addAsset-request.dto";
import { IAddAsset } from "../interfaces/asset.interface";

export class AssetMapper {
  static toAssetEntity(dto: AddAssetRequestDTO): Partial<IAddAsset> {
    return {
      name: dto.name,
      category: dto.category,
      description: dto.description,
      stocks: dto.stocks,
      image: dto.image
    };
  }
}
