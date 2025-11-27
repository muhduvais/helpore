import { plainToInstance } from 'class-transformer';
import { AssetDTO } from '../dtos/asset.dto';
import { IAsset } from '../interfaces/asset.interface';

export const toAssetDTO = (asset: IAsset | null): AssetDTO | null => {
  if (!asset) return null;

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

export const toAssetListDTO = (assets: IAsset[] | null): AssetDTO[] | null => {
  if (!assets) return null;

  return assets.map(asset => toAssetDTO(asset)!) as AssetDTO[];
};