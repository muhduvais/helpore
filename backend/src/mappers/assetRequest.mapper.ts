import { plainToInstance } from "class-transformer";
import { AssetRequestDTO } from "../dtos/asset-request.dto";
import { IAssetRequest } from "../interfaces/asset.interface";

export const toAssetRequestDTO = (request: IAssetRequest): AssetRequestDTO => {
  return plainToInstance(AssetRequestDTO, {
    id: request._id.toString(),
    asset: request.asset,
    user: request.user,
    requestedDate: request.requestedDate.toISOString(),
    quantity: request.quantity,
    status: request.status,
    comment: request.comment,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  });
};

export const toAssetRequestListDTO = (
  requests: IAssetRequest[]
): AssetRequestDTO[] => {
  return requests.map(toAssetRequestDTO);
};
