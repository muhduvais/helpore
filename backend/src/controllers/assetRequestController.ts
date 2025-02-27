import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetRequestController } from './interfaces/IAssetRequestController';
import { IAssetService } from '../services/interfaces/ServiceInterface';

@injectable()
export class AssetRequestController implements IAssetRequestController {
    constructor(
        @inject('IAssetService') private assetService: IAssetService,
    ) {
    this.requestAsset = this.requestAsset.bind(this);
    this.getAssetRequests = this.getAssetRequests.bind(this);
    this.getAssetRequestDetails = this.getAssetRequestDetails.bind(this);
    this.updateAssetRequestStatus = this.updateAssetRequestStatus.bind(this);
    }

    async requestAsset(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        const userId = req.user?.userId;
        const { requestedDate, quantity } = req.body;

        try {
            const createAssetRequest = await this.assetService.createAssetRequest(
                assetId, userId, requestedDate, quantity
            );
            if (createAssetRequest) {
                res.status(200).json({ success: true, message: 'Request created successfully!' });
            }
        } catch (error) {
            console.error('Error creating the request: ', error);
            res.status(500).json({ message: 'Error creating the request: ', error });
        }
    }

    async getAssetRequests(req: Request, res: Response): Promise<void> {
        try {
            const { search, page = 1, limit = 10, sort = "desc", user, status = 'all' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const documentsCount = await this.assetService.countAssetRequests(
                search as string,
                status as string,
            );
            const totalPages = Math.ceil(documentsCount / Number(limit));

            const assetRequests = await this.assetService.fetchAssetRequests(
                search as string,
                skip,
                Number(limit),
                user as string,
                sort as string,
                status as string,
            );

            if (!assetRequests) {
                res.status(404).json({ message: "No asset requests found" });
                return;
            }

            res.status(200).json({ assetRequests, totalPages, totalRequests: documentsCount });
        } catch (error) {
            console.error("Error getting asset requests:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getAssetRequestDetails(req: Request, res: Response): Promise<void> {
        const userId = req.user?.userId;
        const assetId = req.params.id;

        try {
            const assetRequestDetails = await this.assetService.findRequestDetails(
                userId, assetId
            );
            if (assetRequestDetails) {
                res.status(200).json({ success: true, userDetails: assetRequestDetails });
            } else {
                res.status(400).json({ success: false, message: 'Request not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset request details:', error);
            res.status(500).json({ message: 'Error fetching the asset request details', error });
        }
    }

    async updateAssetRequestStatus(req: Request, res: Response): Promise<void> {
        const requestId = req.params.id;
        const { status, comment } = req.body;

        try {
            const updatedRequest = await this.assetService.updateStatus(requestId, status, comment);
            if (!updatedRequest) {
                res.status(404).json({ message: 'Asset request not found' });
                return;
            }
            res.status(200).json(updatedRequest);
        } catch (error) {
            console.error('Error updating asset request status:', error);
            res.status(500).json({ message: 'An error occurred while updating the asset request' });
        }
    }
}