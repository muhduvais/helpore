import { IUpdateAsset } from "../../interfaces/asset.interface";

export class UpdateAssetRequestDTO {
  name!: string;
  category!: string;
  description!: string;
  stocks!: number;
  image!: string;

  static fromRequest(body: IUpdateAsset): UpdateAssetRequestDTO {
    const dto = new UpdateAssetRequestDTO();

    dto.name = body.name;
    dto.category = body.category;
    dto.description = body.description;
    dto.stocks = body.stocks;
    dto.image = body.image;

    return dto;
  }
}
