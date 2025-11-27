import { AddAssetRequestDTO } from "../dtos/requests/addAsset-request.dto";
import { UpdateAssetRequestDTO } from "../dtos/requests/updateAsset-request.dto";
import { IAddAsset, IUpdateAsset } from "../interfaces/asset.interface";

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

  static toUpdateAssetEntity(dto: UpdateAssetRequestDTO): Partial<IUpdateAsset> {
    return {
      name: dto.name,
      category: dto.category,
      description: dto.description,
      stocks: dto.stocks,
      image: dto.image
    };
  }
}
