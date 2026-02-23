import { AssistanceRequestDTO } from "../../dtos/assistance-request.dto";
import { IAssistanceRequest } from "../../interfaces/user.interface";

export interface IAssistanceRequestService {
    createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean>;
    fetchAssistanceRequests(search?: string, filter?: string, skip?: number, limit?: number, sort?: string, priority?: string): Promise<AssistanceRequestDTO[] | null>;
    fetchMyAssistanceRequests(
        userId: string, search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<AssistanceRequestDTO[] | null>;
    fetchProcessingRequests(search: string, filter: string, skip: number, limit: number, volunteerId: string
    ): Promise<AssistanceRequestDTO[] | null>;
    countAssistanceRequests(search?: string, filter?: string, priority?: string): Promise<number>;
    countMyAssistanceRequests(userId: string, search: string, filter: string, priority: string): Promise<number>;
    countProcessingRequests(search?: string, filter?: string, volunteerId?: string): Promise<number>;
    getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any>;
    updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string>;
    fetchAssistanceRequestDetails(requestId: string): Promise<AssistanceRequestDTO | null>;
    checkTasksLimit(volunteerId: string): Promise<boolean | null>;
    assignVolunteer(requestId: string, volunteerId: string): Promise<boolean>;
    fetchPendingRequests(): Promise<AssistanceRequestDTO[] | null>;
}