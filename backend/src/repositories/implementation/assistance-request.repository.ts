import { injectable } from "tsyringe";
import { IAssistanceRequest, IAssistanceRequestDocument, IAssistanceRequestResponse, IUserDocument } from "../../interfaces/user.interface";
import { IAssistanceRequestRepository } from "../interfaces/IAssistanceRequestRepository";
import AssistanceRequest from "../../models/assistance-request.model";
import User from "../../models/user.model";
import { BaseRepository } from "./base.repository";
import mongoose, { Types } from "mongoose";

@injectable()
export class AssistanceRequestRepository extends BaseRepository<IAssistanceRequestDocument> implements IAssistanceRequestRepository {

  async findRequestById(requestId: string): Promise<IAssistanceRequestDocument | null | undefined> {
    try {
      return await AssistanceRequest.findById(requestId);
    } catch (error) {
      console.error('Error finding the request by id:', error);
    }
  }

  async createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean> {
    try {
      const assistanceRequest = new AssistanceRequest(formData);
      await assistanceRequest.save();
      return true;
    } catch (error) {
      console.error('Error creating the request:', error);
      return false;
    }
  }

  async findAssistanceRequests(
    search: string, filter: string, skip: number, limit: number, sort: string, priority: string, userId: string = ''
  ): Promise<IAssistanceRequestResponse[] | null> {
    try {
      const matchStage: any = {};

      if (userId) {
        matchStage.user = new Types.ObjectId(userId);
      }

      if (filter && filter !== "all") {
        matchStage.status = filter;
      }

      if (priority && priority !== "all") {
        matchStage.priority = priority;
      }

      const sortOption = sort === "newest" ? -1 : 1;

      const requests = await AssistanceRequest.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "users",
            localField: "volunteer",
            foreignField: "_id",
            as: "volunteer",
          },
        },
        {
          $unwind: {
            path: "$volunteer",
            preserveNullAndEmptyArrays: true,
          },
        },
        ...(search ? [{ $match: { "user.name": { $regex: search, $options: "i" } } }] : []),
        { $sort: { createdAt: sortOption } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            requestedDate: 1,
            type: 1,
            status: 1,
            priority: 1,
            createdAt: 1,
            updatedAt: 1,
            "user.name": 1,
            volunteer: 1,
          },
        },
      ]);

      return requests as IAssistanceRequestResponse[];
    } catch (error) {
      console.error("Error finding assistance requests:", error);
      return null;
    }
  }

  async findPendingAssistanceRequests(): Promise<IAssistanceRequest[] | null> {
    try {
      const requests = await AssistanceRequest.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return requests;
    } catch (error) {
      console.error("Error finding pending requests:", error);
      return null;
    }
  }

  async findProcessingRequests(
    search: string, filter: string, skip: number, limit: number, volunteerId: string
  ): Promise<IAssistanceRequestResponse[] | null> {
    try {
      const matchStage: any = {
        status: 'approved',
        volunteer: new mongoose.Types.ObjectId(volunteerId),
      };

      if (filter && filter === "ambulance") {
        matchStage.type = filter;
      } else if (filter && filter !== "all") {
        matchStage.volunteerType = filter;
      }

      const requests = await AssistanceRequest.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "users",
            localField: "volunteer",
            foreignField: "_id",
            as: "volunteer",
          },
        },
        {
          $unwind: {
            path: "$volunteer",
            preserveNullAndEmptyArrays: true,
          },
        },
        ...(search ? [{ $match: { "user.name": { $regex: search, $options: "i" } } }] : []),
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            requestedDate: 1,
            type: 1,
            status: 1,
            priority: 1,
            createdAt: 1,
            updatedAt: 1,
            "user.name": 1,
            volunteer: 1,
          },
        },
      ]);

      return requests as IAssistanceRequestResponse[];
    } catch (error) {
      console.error("Error finding assistance requests:", error);
      return null;
    }
  }

  async findPendingRequests(requestQuery: object, skip: number): Promise<IAssistanceRequest[]> {
    return await AssistanceRequest.find(requestQuery).skip(skip)
      .populate('address')
      .populate('user');
  }

  async countAssistanceRequests(search: string, filter: string, priority: string, userId: string = ''): Promise<number> {
    try {
      let query: any = {};

      if (userId) query.user = userId;
      if (search) query["user.name"] = { $regex: search, $options: "i" };
      if (priority && priority !== "all") query.priority = priority;
      if (filter && filter !== "all") query.status = filter;

      return await AssistanceRequest.countDocuments(query);
    } catch (error) {
      console.error("Error counting assistance requests:", error);
      return 0;
    }
  }

  async countProcessingRequests(search: string, filter: string, volunteerId: string): Promise<number> {
    try {
      let query: any = {
        status: 'approved',
        volunteer: volunteerId,
      };

      if (search) query["user.name"] = { $regex: search, $options: "i" };
      if (filter && filter === "ambulance") {
        query.type = filter;
      } else if (filter && filter !== "all") {
        query.volunteerType = filter;
      }

      return await AssistanceRequest.countDocuments(query);
    } catch (error) {
      console.error("Error counting assistance requests:", error);
      return 0;
    }
  }

  async findAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequest | null> {
    try {
      return await AssistanceRequest.findOne({ _id: requestId })
        .populate("user")
        .populate("volunteer")
        .populate("address");
    } catch (error) {
      console.error("Error finding the request details:", error);
      return null;
    }
  }

  async incrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequestDocument | null> {
    return await AssistanceRequest.findByIdAndUpdate(volunteerId, {
      $inc: { tasks: 1 }
    });
  }

  async decrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequestDocument | null> {
    return await AssistanceRequest.findByIdAndUpdate(volunteerId, {
      $inc: { tasks: -1 }
    });
  }

  async updateRequest(request: IAssistanceRequestDocument): Promise<IAssistanceRequestDocument> {
    return await request.save();
  }

  async checkTasksLimit(volunteerId: string): Promise<boolean | null> {
    try {
      const volunteer: IUserDocument | null = await User.findById(volunteerId);
      return volunteer ? volunteer.tasks >= 5 : null;
    } catch (error) {
      console.error("Error checking volunteer task limit:", error);
      return null;
    }
  }

  async assignVolunteer(requestId: string, volunteerId: string): Promise<any> {
    try {
      const assigned = await AssistanceRequest.findByIdAndUpdate(
        requestId,
        { volunteer: volunteerId, status: "approved" },
        { new: true }
      );

      if (assigned) {
        await User.findByIdAndUpdate(volunteerId, { $inc: { tasks: 1 } });
      }

      return assigned;
    } catch (error) {
      console.error("Error assigning volunteer:", error);
      return null;
    }
  }
}
