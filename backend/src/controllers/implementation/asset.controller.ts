import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetService } from '../../services/interfaces/ServiceInterface';
import { IAssetController } from '../interfaces/IAssetController';

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
            const data = req.body.formData;
            await this.assetService.addAsset(data);
            res.status(201).json({
                success: true,
                message: 'Asset added successfully',
            });
        } catch (error) {
            console.error('Error creating the asset:', error);
            res.status(500).json({ message: 'Error creating the asset', error });
        }
    }

    async uploadAssetImage(req: Request, res: Response): Promise<void> {
        try {
          const file = req.file;
          
          if (!file) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
          }
    
          console.log('Received file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
    
          const imageUrl = await this.assetService.uploadAssetImage(file);
    
          res.status(200).json({ imageUrl });
        } catch (error) {
          console.error('Error uploading the asset image: ', error);
          res.status(500).json({
            message: 'Error uploading the asset image',
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
                res.status(200).json({ success: true, assets, totalPages });
            } else {
                res.status(400).json({ success: false, message: 'Assets not found!' });
            }
        } catch (error) {
            console.error('Error fetching the assets:', error);
            res.status(500).json({ message: 'Error fetching the assets', error });
        }
    }

    async getAssetDetails(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        try {
            const asset = await this.assetService.fetchAssetDetails(assetId);
            if (asset) {
                res.status(200).json({ success: true, asset });
            } else {
                res.status(400).json({ success: false, message: 'Asset not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset details:', error);
            res.status(500).json({ message: 'Error fetching the asset details', error });
        }
    }

    async updateAsset(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        const submitData = req.body.submitData;
        try {
            const asset = await this.assetService.updateAsset(assetId, submitData);
            if (asset) {
                res.status(200).json({ success: true, asset });
            } else {
                res.status(400).json({ success: false, message: 'Asset not found!' });
            }
        } catch (error) {
            console.error('Error updating the asset details:', error);
            res.status(500).json({ message: 'Error updating the asset details', error });
        }
    }
}