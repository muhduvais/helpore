import { injectable, inject } from "tsyringe";
import { IAssistanceRequestService } from "../interfaces/ServiceInterface";
import { IAssistanceRequest, IAssistanceRequestResponse } from "../../interfaces/user.interface";
import { Types } from "mongoose";
import { IAddressRepository } from "../../repositories/interfaces/IAddressRepository";
import { calculateDistance, MAX_DISTANCE, MIN_DISTANCE } from '../../utils';
import { IAssistanceRequestRepository } from "../../repositories/interfaces/IAssistanceRequestRepository";
import { ErrorMessages } from '../../constants/errorMessages';
import { AssistanceRequestDTO } from "../../dtos/assistance-request.dto";
import { toAssistanceRequestDTO, toAssistanceRequestListDTO } from "../../mappers/assistance-request.mapper";

@injectable()
export class AssistanceRequestService implements IAssistanceRequestService {
    constructor(
        @inject('IAssistanceRequestRepository') private readonly assistanceRepository: IAssistanceRequestRepository,
        @inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
    ) { }

    async createAssistanceRequest(formData: IAssistanceRequest): Promise<boolean> {
        try {
            await this.assistanceRepository.createAssistanceRequest(formData);
            return true;
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_CREATE_FAILED, error);
            return false;
        }
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

    async getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any> {
        try {
            let query: any = {
                entity: volunteerId,
                type: 'volunteer',
                rejectedBy: { $nin: [volunteerId] }
            };

            const volunteerAddress = await this.addressRepository.findAddressesByQuery(query);

            if (!volunteerAddress) {
                throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
            }

            if (!volunteerAddress.latitude || !volunteerAddress.longitude) {
                throw new Error(ErrorMessages.ADDRESS_NOT_FOUND);
            }

            let requestQuery: any = {
                status: 'pending',
                volunteer: null,
                rejectedBy: { $nin: [volunteerId] }
            };

            if (search) requestQuery.description = { $regex: search, $options: 'i' };
            if (filter && filter !== 'ambulance') requestQuery.volunteerType = filter;
            if (filter && filter === 'ambulance') requestQuery.type = filter;

            let skip = (page - 1) * 4;

            const pendingRequests = await this.assistanceRepository.findPendingRequests(requestQuery, skip);

            if (!pendingRequests || !pendingRequests.length) {
                return [];
            }

            const requestsWithPromises = pendingRequests
                .map((request: any) => {
                    if (!request.address || !request.address.latitude || !request.address.longitude) {
                        console.warn(`${ErrorMessages.ASSISTANCE_REQUEST_DETAILS_FETCH_FAILED}: Request ${request._id} has invalid address`);
                        return null;
                    }

                    if (!volunteerAddress || !volunteerAddress.latitude || !volunteerAddress.longitude) {
                        console.warn(`${ErrorMessages.ADDRESS_NOT_FOUND}: Request ${request._id} has invalid volunteerAddress`);
                        return null;
                    }

                    const distance = calculateDistance(
                        volunteerAddress.latitude,
                        volunteerAddress.longitude,
                        request.address.latitude,
                        request.address.longitude
                    );

                    if (isNaN(distance) || distance < MIN_DISTANCE || distance > MAX_DISTANCE) {
                        return null;
                    }

                    return {
                        request: request.toObject(),
                        distance: Number(distance.toFixed(1)),
                        travelTimePromise: this.calculateEstimatedTravelTime(distance)
                    };
                })
                .filter((request): request is NonNullable<typeof request> => request !== null)

            const nearbyRequests = await Promise.all(
                requestsWithPromises.map(async (item) => {
                    const travelTime = await item.travelTimePromise;
                    return {
                        ...item.request,
                        distance: item.distance,
                        estimatedTravelTime: travelTime
                    };
                })
            );

            const sortedRequests = nearbyRequests.sort((a, b) => a.distance - b.distance);

            return {
                requests: sortedRequests,
                metadata: {
                    total: sortedRequests.length,
                    volunteerLocation: {
                        latitude: volunteerAddress.latitude,
                        longitude: volunteerAddress.longitude
                    },
                    searchRadius: MAX_DISTANCE,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_NEARBY_FAILED, error);
            throw error;
        }
    }

    async updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string> {
        const request = await this.assistanceRepository.findRequestById(requestId);

        if (!request) {
            throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND);
        }

        if (action === 'approve' && request.status !== 'pending') {
            throw new Error(ErrorMessages.ASSISTANCE_REQUEST_UPDATE_STATUS_FAILED);
        }

        if (action === 'approve') {
            request.volunteer = volunteerId;
            request.status = 'approved';
            await this.assistanceRepository.incrementVolunteerTasks(volunteerId);
        }

        if (action === 'reject') {
            if (!request.rejectedBy?.includes(volunteerId)) {
                request.rejectedBy?.push(volunteerId);
            }
        }

        if (action === 'complete') {
            request.status = 'completed';
            await this.assistanceRepository.decrementVolunteerTasks(volunteerId);
        }

        await this.assistanceRepository.updateRequest(request);

        if (action === 'approve') {
            return ErrorMessages.ASSISTANCE_REQUEST_APPROVED;
        } else if (action === 'reject') {
            return ErrorMessages.ASSISTANCE_REQUEST_REJECTED;
        } else if (action === 'complete') {
            return ErrorMessages.ASSISTANCE_REQUEST_COMPLETED;
        }
        return '';
    }

    async fetchAssistanceRequests(
        search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<AssistanceRequestDTO[] | null> {
        try {
            const assistanceRequests = await this.assistanceRepository.findAssistanceRequests(search, filter, skip, limit, sort, priority);

            if (!assistanceRequests) {
                throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND);
            }
 
            return toAssistanceRequestListDTO(assistanceRequests);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            throw new Error(ErrorMessages.SERVER_ERROR);
        }
    }

    async fetchMyAssistanceRequests(
        userId: string, search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<AssistanceRequestDTO[] | null> {
        try {
            const assistanceRequests = await this.assistanceRepository.findAssistanceRequests(search, filter, skip, limit, sort, priority, userId);

            if (!assistanceRequests) {
                throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND)
            }

            return toAssistanceRequestListDTO(assistanceRequests);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            throw new Error(ErrorMessages.SERVER_ERROR);
        }
    }

    async fetchPendingRequests(): Promise<AssistanceRequestDTO[] | null> {
        try {
            const assistanceRequests = await this.assistanceRepository.findPendingAssistanceRequests();

            if (!assistanceRequests) {
                throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND);
            }

            return toAssistanceRequestListDTO(assistanceRequests);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_PENDING_FAILED, error);
            return null;
        }
    }

    async fetchProcessingRequests(
        search: string, filter: string, skip: number, limit: number, volunteerId: string
    ): Promise<AssistanceRequestDTO[] | null> {
        try {
            const assistanceRequests = await this.assistanceRepository.findProcessingRequests(search, filter, skip, limit, volunteerId);
            if (!assistanceRequests) {
                throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND);
            }

            return toAssistanceRequestListDTO(assistanceRequests);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_PROCESSING_FAILED, error);
            return null;
        }
    }

    async countAssistanceRequests(search: string, filter: string, priority: string): Promise<number> {
        try {
            return await this.assistanceRepository.countAssistanceRequests(search, filter, priority);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            return 0;
        }
    }

    async countMyAssistanceRequests(userId: string, search: string, filter: string, priority: string): Promise<number> {
        try {
            return await this.assistanceRepository.countAssistanceRequests(search, filter, priority, userId);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_FAILED, error);
            return 0;
        }
    }

    async countProcessingRequests(search: string, filter: string, volunteerId: string): Promise<number> {
        try {
            return await this.assistanceRepository.countProcessingRequests(search, filter, volunteerId);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_FETCH_PROCESSING_FAILED, error);
            return 0;
        }
    }

    async fetchAssistanceRequestDetails(requestId: string): Promise<AssistanceRequestDTO | null> {
        try {
            const assistanceRequest = await this.assistanceRepository.findAssistanceRequestDetails(requestId);
            if (!assistanceRequest) {
                throw new Error(ErrorMessages.ASSISTANCE_REQUEST_NOT_FOUND);
            }

            return toAssistanceRequestDTO(assistanceRequest);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_DETAILS_FETCH_FAILED, error);
            return null;
        }
    }

    async checkTasksLimit(volunteerId: string): Promise<boolean | null> {
        try {
            return await this.assistanceRepository.checkTasksLimit(volunteerId);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_TASK_LIMIT, error);
            return null;
        }
    }

    async assignVolunteer(requestId: string, volunteerId: string): Promise<any> {
        try {
            return await this.assistanceRepository.assignVolunteer(requestId, volunteerId);
        } catch (error) {
            console.error(ErrorMessages.ASSISTANCE_REQUEST_VOLUNTEER_ASSIGN_FAILED, error);
            return null;
        }
    }
}