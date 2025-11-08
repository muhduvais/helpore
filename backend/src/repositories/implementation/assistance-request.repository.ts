import { injectable } from "tsyringe";
import {
  IAssistanceRequest,
  IAssistanceRequestDocument,
  IAssistanceRequestPopulated,
  IAssistanceRequestResponse,
  IUserDocument,
} from "../../interfaces/user.interface";
import { IAssistanceRequestRepository } from "../interfaces/IAssistanceRequestRepository";
import AssistanceRequest from "../../models/assistance-request.model";
import User from "../../models/user.model";
import { BaseRepository } from "./base.repository";
import mongoose, { Types } from "mongoose";

@injectable()
export class AssistanceRequestRepository
  extends BaseRepository<IAssistanceRequestDocument>
  implements IAssistanceRequestRepository
{
  async findRequestById(
    requestId: string
  ): Promise<IAssistanceRequest | null | undefined> {
    try {
      return await AssistanceRequest.findById(requestId).lean();
    } catch (error) {
      console.error("Error finding the request by id:", error);
    }
  }

  async createAssistanceRequest(
    formData: IAssistanceRequest
  ): Promise<boolean> {
    try {
      const assistanceRequest = new AssistanceRequest(formData);
      await assistanceRequest.save();
      return true;
    } catch (error) {
      console.error("Error creating the request:", error);
      return false;
    }
  }

  async findAssistanceRequests(
    search: string,
    filter: string,
    skip: number,
    limit: number,
    sort: string,
    priority: string,
    userId: string = ""
  ): Promise<IAssistanceRequestPopulated[] | null> {
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
        ...(search
          ? [{ $match: { "user.name": { $regex: search, $options: "i" } } }]
          : []),
        { $sort: { createdAt: sortOption } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            type: 1,
            status: 1,
            priority: 1,
            requestedDate: 1,
            requestedTime: 1,
            createdAt: 1,
            updatedAt: 1,

            user: {
              _id: "$user._id",
              name: "$user.name",
              phone: "$user.phone",
              email: "$user.email",
              profilePicture: "$user.profilePicture",
            },

            volunteer: {
              _id: "$volunteer._id",
              name: "$volunteer.name",
              phone: "$volunteer.phone",
              email: "$volunteer.email",
              profilePicture: "$volunteer.profilePicture",
            },
          },
        },
      ]);

      return requests as IAssistanceRequestPopulated[];
    } catch (error) {
      console.error("Error finding assistance requests:", error);
      return null;
    }
  }

  async findPendingAssistanceRequests(): Promise<
    IAssistanceRequestPopulated[] | null
  > {
    try {
      const requests = await AssistanceRequest.find({ status: "pending" })
        .populate("user", "name phone email profilePicture")
        .populate("volunteer", "name phone email profilePicture")
        .populate("address", "street city state zipCode")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return requests as unknown as IAssistanceRequestPopulated[];
    } catch (error) {
      console.error("Error finding pending requests:", error);
      return null;
    }
  }

  async findProcessingRequests(
    search: string,
    filter: string,
    skip: number,
    limit: number,
    volunteerId: string
  ): Promise<IAssistanceRequestPopulated[] | null> {
    try {
      const matchStage: any = {
        status: "approved",
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
        ...(search
          ? [{ $match: { "user.name": { $regex: search, $options: "i" } } }]
          : []),
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            type: 1,
            status: 1,
            priority: 1,
            requestedDate: 1,
            requestedTime: 1,
            createdAt: 1,
            updatedAt: 1,

            user: {
              _id: "$user._id",
              name: "$user.name",
              phone: "$user.phone",
              email: "$user.email",
              profilePicture: "$user.profilePicture",
            },

            volunteer: {
              _id: "$volunteer._id",
              name: "$volunteer.name",
              phone: "$volunteer.phone",
              email: "$volunteer.email",
              profilePicture: "$volunteer.profilePicture",
            },
          },
        },
      ]);

      return requests as IAssistanceRequestPopulated[];
    } catch (error) {
      console.error("Error finding assistance requests:", error);
      return null;
    }
  }

  async findPendingRequests(
    requestQuery: object,
    skip: number
  ): Promise<IAssistanceRequest[]> {
    return await AssistanceRequest.find(requestQuery)
      .skip(skip)
      .populate("address")
      .populate("volunteer")
      .populate("user")
      .lean();
  }

  async countAssistanceRequests(
    search: string,
    filter: string,
    priority: string,
    userId: string = ""
  ): Promise<number> {
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

  async countProcessingRequests(
    search: string,
    filter: string,
    volunteerId: string
  ): Promise<number> {
    try {
      let query: any = {
        status: "approved",
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

  async findAssistanceRequestDetails(
    requestId: string
  ): Promise<IAssistanceRequestPopulated | null> {
    try {
      return await AssistanceRequest.findOne({ _id: requestId })
        .populate<{
          user: {
            _id: Types.ObjectId;
            name: string;
            phone?: string;
            email: string;
            profilePicture: string;
          };
        }>("user")
        .populate<{
          volunteer: {
            _id: Types.ObjectId;
            name: string;
            phone?: string;
            email?: string;
            profilePicture?: string;
          };
        }>("volunteer")
        .populate<{
          address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
          };
        }>("address")
        .lean<IAssistanceRequestPopulated>();
    } catch (error) {
      console.error("Error finding the request details:", error);
      return null;
    }
  }

  async incrementVolunteerTasks(
    volunteerId: string
  ): Promise<IAssistanceRequest | null> {
    return await AssistanceRequest.findByIdAndUpdate(volunteerId, {
      $inc: { tasks: 1 },
    }).lean();
  }

  async decrementVolunteerTasks(
    volunteerId: string
  ): Promise<IAssistanceRequest | null> {
    return await AssistanceRequest.findByIdAndUpdate(volunteerId, {
      $inc: { tasks: -1 },
    }).lean();
  }

  async updateRequest(
    request: IAssistanceRequest
  ): Promise<IAssistanceRequest | null> {
    try {
      if (!request._id) {
        return null;
      }

      const updated = await AssistanceRequest.findByIdAndUpdate(
        request._id,
        request,
        { new: true }
      ).lean();

      return updated as IAssistanceRequest | null;
    } catch (error) {
      console.error("Error updating request:", error);
      return null;
    }
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

  async assignVolunteer(
    requestId: string,
    volunteerId: string
  ): Promise<IAssistanceRequest | null> {
    try {
      const assigned = await AssistanceRequest.findByIdAndUpdate(
        requestId,
        { volunteer: volunteerId, status: "approved" },
        { new: true }
      ).lean();

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
