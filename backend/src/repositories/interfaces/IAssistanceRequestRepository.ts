import { IAssistanceRequest, IAssistanceRequestDocument, IAssistanceRequestResponse } from "../../interfaces/user.interface";

export interface IAssistanceRequestRepository {
  createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
  findAssistanceRequests(search: string, filter: string, skip: number, limit: number, sort: string, priority: string): Promise<IAssistanceRequestResponse[] | null>;
  countAssistanceRequests(search: string, filter: string, priority: string): Promise<number>;
  countProcessingRequests(search: string, filter: string, volunteerId: string): Promise<number>
  findPendingRequests(requestQuery: object, skip: number): Promise<IAssistanceRequestDocument[]> | null;
  findProcessingRequests(search: string, filter: string, skip: number, limit: number, volunteerId: string
  ): Promise<IAssistanceRequestResponse[] | null>
  findRequestById(requestId: string): Promise<IAssistanceRequestDocument>;
  findAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequestDocument>;
  incrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequestDocument>;
  updateRequest(request: Partial<IAssistanceRequestDocument>): Promise<IAssistanceRequestDocument>;
  checkTasksLimit(volunteerId: string): Promise<boolean | null>;
  assignVolunteer(requestId: string, volunteerId: string): Promise<any>;
}
