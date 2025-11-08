import { IAssistanceRequest, IAssistanceRequestPopulated } from "../../interfaces/user.interface";

export interface IAssistanceRequestRepository {
  createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
  findAssistanceRequests(search: string, filter: string, skip: number, limit: number, sort: string, priority: string, userId?: string
  ): Promise<IAssistanceRequestPopulated[] | null>;
  countAssistanceRequests(search: string, filter: string, priority: string, userId?: string): Promise<number>;
  countProcessingRequests(search: string, filter: string, volunteerId: string): Promise<number>
  findPendingRequests(requestQuery: object, skip: number): Promise<IAssistanceRequest[]> | null;
  findPendingAssistanceRequests (): Promise<IAssistanceRequestPopulated[] | null>;
  findProcessingRequests(search: string, filter: string, skip: number, limit: number, volunteerId: string
  ): Promise<IAssistanceRequestPopulated[] | null>
  findRequestById(requestId: string): Promise<IAssistanceRequest | null | undefined>
  findAssistanceRequestDetails(requestId: string): Promise<IAssistanceRequestPopulated | null>;
  incrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequest | null>;
  decrementVolunteerTasks(volunteerId: string): Promise<IAssistanceRequest | null>;
  updateRequest(request: IAssistanceRequest): Promise<IAssistanceRequest | null>;
  checkTasksLimit(volunteerId: string): Promise<boolean | null>;
  assignVolunteer(requestId: string, volunteerId: string): Promise<any>;
}
