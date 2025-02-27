import { IAssistanceRequest, IAssistanceRequestDocument, IAssistanceRequestResponse } from "../../interfaces/userInterface";

export interface IAssistanceRequestRepository {
  createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
  findAssistanceRequests(search: string, filter: string, skip: number, limit: number, sort: string, priority: string): Promise<IAssistanceRequestResponse[] | null>;
  countAssistanceRequests(search: string, filter: string, priority: string): Promise<number>;
  findPendingRequests(requestQuery: object, skip: number): Promise<IAssistanceRequestDocument[]> | null;
  findRequestById(requestId: string): Promise<IAssistanceRequestDocument>;
  calculateEstimatedTravelTime(distanceInKm: number): Promise<string>;
  findAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequestDocument>;
  incrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequestDocument>;
  updateRequest(request: Partial<IAssistanceRequestDocument>): Promise<IAssistanceRequestDocument>;
  checkTasksLimit(volunteerId: string): Promise<boolean | null>;
  assignVolunteer(requestId: string, volunteerId: string): Promise<any>;
}
