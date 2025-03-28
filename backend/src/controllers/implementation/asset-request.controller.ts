import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetRequestController } from '../interfaces/IAssetRequestController';
import { IAssetService, IUserService } from '../../services/interfaces/ServiceInterface';
import { JwtPayload } from 'jsonwebtoken';

@injectable()
export class AssetRequestController implements IAssetRequestController {
    constructor(
        @inject('IAssetService') private readonly assetService: IAssetService,
        @inject('IUserService') private readonly userService: IUserService,
    ) {
        this.requestAsset = this.requestAsset.bind(this);
        this.getAssetRequests = this.getAssetRequests.bind(this);
        this.getMyAssetRequests = this.getMyAssetRequests.bind(this);
        this.getAssetRequestDetails = this.getAssetRequestDetails.bind(this);
        this.updateAssetRequestStatus = this.updateAssetRequestStatus.bind(this);
    }

    async requestAsset(req: Request, res: Response): Promise<void> {
        const assetId = req.params.id;
        const { userId } = req.user as JwtPayload;
        const { requestedDate, quantity } = req.body;

        try {
            const isCertificateAdded = await this.userService.checkCertificate(userId);

            if (!isCertificateAdded) {
                res.status(400).json({ success: false, noCertificate: true, message: 'You cannot request without adding your medical certificates. Pease go to \'Profile > Uploads\' and upload the documents.' });
                return;
            }

            const isLimit = await this.assetService.checkIsRequestLimit(userId, quantity);

            if (isLimit) {
                res.status(400).json({ success: false, isRequestLimit: true, message: 'You cannot have more than 3 requests at a time! Try requesting lesser quantity.' });
                return;
            }

            const createAssetRequest = await this.assetService.createRequest(
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

            const documentsCount = await this.assetService.countRequests(
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

    async getMyAssetRequests(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        let limit = parseInt(req.query.limit as string, 10) || 5;
        const search = req.query.search as string;
        const filter = req.query.filter as string;

        let skip = (page - 1) * limit;

        const { userId } = req.user as JwtPayload;

        try {
            const assetRequests = await this.assetService.fetchMyAssetRequests(search, filter, skip, limit, userId);
            const documentsCount = await this.assetService.countMyAssetRequests(userId, search, filter) || 0;
            const totalPages = Math.ceil(documentsCount / limit);

            if (assetRequests) {
                res.status(200).json({ success: true, assetRequests, totalPages, totalRequests: documentsCount });
            } else {
                res.status(400).json({ success: false, message: 'Asset requests not found!' });
            }
        } catch (error) {
            console.error('Error fetching the asset requests:', error);
            res.status(500).json({ message: 'Error fetching the asset requests', error });
        }
    }

    async getAssetRequestDetails(req: Request, res: Response): Promise<void> {
        const { userId } = req.user as JwtPayload;
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