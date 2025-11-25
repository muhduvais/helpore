import { IAddAsset } from "../../interfaces/asset.interface";

export class AddAssetRequestDTO {
  name!: string;
  category!: string;
  description!: string;
  stocks!: number;
  image!: string;

  static fromRequest(body: IAddAsset): AddAssetRequestDTO {
    const dto = new AddAssetRequestDTO();

    dto.name = body.name;
    dto.category = body.category;
    dto.description = body.description;
    dto.stocks = body.stocks;
    dto.image = body.image;

    return dto;
  }
}
