import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetService } from '../../services/interfaces/ServiceInterface';
import { IAssetController } from '../interfaces/IAssetController';
import { HttpStatusCode } from '../../constants/httpStatus';
import { ErrorMessages } from '../../constants/errorMessages';
import { AddAssetRequestDTO } from '../../dtos/requests/addAsset-request.dto';
import { UpdateAssetRequestDTO } from '../../dtos/requests/updateAsset-request.dto';

@injectable()
export class AssetController implements IAssetController {
    constructor(
        @inject('IAssetService') private readonly assetService: IAssetService
    ) {
        this.addAsset = this.addAsset.bind(this);
        this.uploadAssetImage = this.uploadAssetImage.bind(this);
        this.getAssets = this.getAssets.bind(this);
        this.getAssetDetails = this.getAssetDetails.bind(this);
        this.updateAsset = this.updateAsset.bind(this);
    }

    async addAsset(req: Request, res: Response): Promise<void> {
        try {
            const dto = AddAssetRequestDTO.fromRequest(req.body.formData ?? req.body);

            const createdAsset = await this.assetService.addAsset(dto);
            res.status(HttpStatusCode.CREATED).json({
                success: true,
                createdAsset,
                message: ErrorMessages.ASSET_CREATE_SUCCESS,
            });
        } catch (error) {
            console.error(ErrorMessages.ASSET_CREATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: ErrorMessages.ASSET_CREATE_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async uploadAssetImage(req: Request, res: Response): Promise<void> {
        try {
            const file = req.file;

            if (!file) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: ErrorMessages.NO_IMAGE_UPLOADED });
                return;
            }

            console.log('Received file:', {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });

            const imageUrl = await this.assetService.uploadAssetImage(file);

            res.status(HttpStatusCode.OK).json({ imageUrl });
        } catch (error) {
            console.error(ErrorMessages.ASSET_UPLOAD_IMAGE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: ErrorMessages.ASSET_UPLOAD_IMAGE_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAssets(req: Request, res: Response): Promise<void> {

        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const filterByAvailability = req.query.filterByAvailability as string;

        let skip = (page - 1) * limit;

        try {
            const assets = await this.assetService.fetchAssets(search, skip, limit, sortBy, filterByAvailability);
            const documentsCount = await this.assetService.countAssets(search);
            const totalPages = Math.ceil(documentsCount / limit);

            if (assets) {
                res.status(HttpStatusCode.OK).json({ success: true, assets, totalPages });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ASSET_NOT_FOUND });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSET_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: ErrorMessages.ASSET_FETCH_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAssetDetails(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        try {
            const asset = await this.assetService.fetchAssetDetails(assetId);
            if (asset) {
                res.status(HttpStatusCode.OK).json({ success: true, asset });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ASSET_NOT_FOUND });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSET_DETAILS_FETCH_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: ErrorMessages.ASSET_DETAILS_FETCH_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateAsset(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        try {
            const dto = UpdateAssetRequestDTO.fromRequest(req.body.submitData ?? req.body);
            
            const asset = await this.assetService.updateAsset(assetId, dto);
            if (asset) {
                res.status(HttpStatusCode.OK).json({ success: true, asset });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: ErrorMessages.ASSET_NOT_FOUND });
            }
        } catch (error) {
            console.error(ErrorMessages.ASSET_UPDATE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: ErrorMessages.ASSET_UPDATE_FAILED,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}