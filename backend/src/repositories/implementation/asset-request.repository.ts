import { injectable } from "tsyringe";
import { IAssetRequest, IAssetRequestResponse } from "../../interfaces/user.interface";
import AssetRequest from "../../models/asset-request.model";
import { IAssetRequestRepository } from "../interfaces/IAssetRequestRepository";
import mongoose from "mongoose";
import { BaseRepository } from "./base.repository";
import Asset from "../../models/asset.model";

@injectable()
export class AssetRequestRepository extends BaseRepository<IAssetRequest> implements IAssetRequestRepository {
  constructor() {
    super(AssetRequest);
  }

  async createAssetRequest(assetId: string, userId: string, requestedDate: Date, quantity: number): Promise<boolean> {
    try {
      console.log('qty: ', quantity)
      const assetRequest = new AssetRequest({ asset: assetId, user: userId, requestedDate, quantity, status: 'pending' });
      await assetRequest.save();
      await Asset.findByIdAndUpdate(assetId, { $inc: { stocks: -quantity } })
      return true;
    } catch (error) {
      console.error('Error creating the request:', error);
      return false;
    }
  }

  async findRequests(
    search: string,
    skip: number,
    userId: string,
    limit: number,
    sort: string,
    status: string,
  ): Promise<IAssetRequestResponse[] | null> {
    try {
      let query: any = {};

      if (userId !== "all") {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error("Invalid user ID format");
        }
        query.user = new mongoose.Types.ObjectId(userId);
      }

      if (search) {
        query.$or = [
          { "asset.name": { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } }
        ];
      }

      if (status !== 'all') {
        query.status = status;
      }

      const sortOption = sort === "newest" ? -1 : 1;

      const requests = await AssetRequest.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: 'asset',
            foreignField: '_id',
            as: 'asset'
          }
        },
        { $unwind: '$asset' },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: query },
        { $sort: { createdAt: sortOption } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            asset: 1,
            user: 1,
            requestedDate: 1,
            quantity: 1,
            status: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);

      return requests.map(request => ({
        _id: request._id.toString(),
        asset: request.asset,
        user: request.user,
        requestedDate: request.requestedDate.toISOString(),
        quantity: request.quantity,
        status: request.status,
        comment: request.comment,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error("Error finding asset requests:", error);
      return null;
    }
  }

  async findMyRequests(search: string, filter: string, userId: string, skip: number, limit: number): Promise<IAssetRequestResponse[] | null> {
    try {
      const matchStage: any = filter ? { user: new mongoose.Types.ObjectId(userId), status: filter } : { user: new mongoose.Types.ObjectId(userId) };

      if (search) {
        matchStage['asset.name'] = { $regex: search, $options: 'i' };
      }

      const requests = await AssetRequest.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'assets',
            localField: 'asset',
            foreignField: '_id',
            as: 'asset'
          }
        },
        { $unwind: '$asset' },
        { $match: matchStage },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            asset: 1,
            requestedDate: 1,
            quantity: 1,
            status: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);

      return requests as IAssetRequestResponse[];
    } catch (error) {
      console.error('Error finding the asset requests:', error);
      return null;
    }
  }


  async countMyRequests(query: object): Promise<number> {
    try {
      return await AssetRequest.countDocuments(query);
    } catch (error) {
      console.error('Error counting the assetRequests:', error);
      return 0;
    }
  }

  async findRequestDetails(userId: string, assetId: string): Promise<IAssetRequest[]> {
    try {
      return await AssetRequest.find({ asset: assetId, user: userId });
    } catch (error) {
      console.error('Error finding asset request details:', error);
      throw error;
    }
  }

  async countRequests(query: object): Promise<number> {
    try {
      return await AssetRequest.countDocuments(query);
    } catch (error) {
      console.error('Error counting asset requests:', error);
      return 0;
    }
  }

  async updateStatus(requestId: string, status: string, comment: string): Promise<IAssetRequest | null> {
    try {
      const updatedRequest = await AssetRequest.findByIdAndUpdate(
        requestId,
        { status, comment }
      );

      return updatedRequest;
    } catch (error) {
      console.error('Error updating asset request status in repository:', error);
      throw error;
    }
  }

  async findMyAllRequests(userId: string): Promise<IAssetRequest[] | null> {
    try {
      return await AssetRequest.find({ user: userId });
    } catch (error) {
      console.error('Error finding asset requests:', error);
      return null;
    }
  }
}