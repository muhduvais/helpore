import { injectable } from "tsyringe";
import { IAssistanceRequest, IAssistanceRequestDocument, IAssistanceRequestResponse } from "../interfaces/userInterface";
import { IAssistanceRepository } from "../repositories/interfaces/IAssistanceRequestRepository";
import AssistanceRequest from "../models/assistanceRequestModel";
import User from "../models/userModel";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class AssistanceRequestRepository extends BaseRepository<IAssistanceRequestDocument> implements IAssistanceRepository {

  async findRequestById(requestId: string): Promise<IAssistanceRequestDocument> {
    return await this.findById(requestId);
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
    search: string, filter: string, skip: number, limit: number, sort: string, priority: string
  ): Promise<IAssistanceRequestResponse[] | null> {
    try {
      const matchStage: any = {};

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

  async findPendingRequests(requestQuery: object, skip: number): Promise<IAssistanceRequestDocument[]> {
    return await AssistanceRequest.find(requestQuery).skip(skip)
      .populate('address')
      .populate('user');
  }

  async calculateEstimatedTravelTime(distanceInKm: number): Promise<string> {

    const timeInHours = distanceInKm / 30;
    const timeInMinutes = Math.round(timeInHours * 60);

    if (timeInMinutes < 60) {
      return `${timeInMinutes} minutes`;
    }

    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }

  async countAssistanceRequests(search: string, filter: string, priority: string): Promise<number> {
    try {
      let query: any = {};

      if (search) query["user.name"] = { $regex: search, $options: "i" };
      if (priority && priority !== "all") query.priority = priority;
      if (filter && filter !== "all") query.status = filter;

      return await AssistanceRequest.countDocuments(query);
    } catch (error) {
      console.error("Error counting assistance requests:", error);
      return 0;
    }
  }

  async findAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequestDocument> {
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

  async incrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequestDocument> {
    return await this.findByIdAndUpdate(volunteerId, {
      $inc: { tasks: 1 }
    });
  }

  async updateRequest(request: Partial<IAssistanceRequestDocument>): Promise<IAssistanceRequestDocument> {
    return await request.save();
  }

  async checkTasksLimit(volunteerId: string): Promise<boolean | null> {
    try {
      const volunteer = await User.findById(volunteerId);
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
