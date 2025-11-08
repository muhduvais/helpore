
import { plainToInstance } from 'class-transformer';
import { AssetDTO } from '../dtos/asset.dto';
import { IAsset } from '../interfaces/user.interface';

export const toAssetDTO = (asset: IAsset): AssetDTO => {
  return plainToInstance(AssetDTO, {
    id: asset._id.toString(),
    name: asset.name,
    category: asset.category,
    description: asset.description,
    stocks: asset.stocks,
    image: asset.image,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  });
};

export const toAssetListDTO = (assets: IAsset[]): AssetDTO[] => {
  return assets.map(toAssetDTO);
};
