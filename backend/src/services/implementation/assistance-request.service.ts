import { injectable, inject } from "tsyringe";
import { IAssistanceRequestService } from "../interfaces/ServiceInterface";
import { IAssistanceRequest, IAssistanceRequestResponse } from "../../interfaces/user.interface";
import { Types } from "mongoose";
import { IAddressRepository } from "../../repositories/interfaces/IAddressRepository";
import { calculateDistance, MAX_DISTANCE, MIN_DISTANCE } from '../../utils';
import { IAssistanceRequestRepository } from "../../repositories/interfaces/IAssistanceRequestRepository";

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
            console.error('Error creating the request: ', error);
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
                throw new Error('Volunteer address not found');
            }

            if (!volunteerAddress.latitude || !volunteerAddress.longitude) {
                throw new Error('Volunteer address missing coordinates');
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
                        console.warn(`Request ${request._id} has invalid address`);
                        return null;
                    }

                    if (!volunteerAddress || !volunteerAddress.latitude || !volunteerAddress.longitude) {
                        console.warn(`Request ${request._id} has invalid volunteerAddress`);
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
            console.error('Error finding nearby requests:', error);
            throw error;
        }
    }

    async updateRequestStatus(requestId: string, volunteerId: string, action: string): Promise<string> {
        const request = await this.assistanceRepository.findRequestById(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Request is no longer available');
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

        await this.assistanceRepository.updateRequest(request);
        return action === 'approve' ? 'Request approved' : 'Request rejected';
    }

    async fetchAssistanceRequests(
        search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<IAssistanceRequestResponse[] | null> {
        try {
            const results = await this.assistanceRepository.findAssistanceRequests(search, filter, skip, limit, sort, priority);

            if (!results) return null;

            return results.map((request: IAssistanceRequestResponse) => ({
                ...request,
                requestedDate: new Date(request.requestedDate).toISOString(),
                address: request.address instanceof Types.ObjectId ? undefined : request.address,
            }));
        } catch (error) {
            console.error("Error finding assistance requests:", error);
            return null;
        }
    }

    async fetchPendingRequests (): Promise<IAssistanceRequest[] | null> {
        try {
            const results = await this.assistanceRepository.findPendingAssistanceRequests();

            if (!results) return null;

            return results.map((request: IAssistanceRequest) => ({
                ...request,
                requestedDate: new Date(request.requestedDate).toISOString(),
                address: request.address instanceof Types.ObjectId ? undefined : request.address,
            }));
        } catch (error) {
            console.error("Error finding assistance requests:", error);
            return null;
        }
    }

    async fetchProcessingRequests(
        search: string, filter: string, skip: number, limit: number, volunteerId: string
    ): Promise<IAssistanceRequestResponse[] | null> {
        try {
            const results = await this.assistanceRepository.findProcessingRequests(search, filter, skip, limit, volunteerId);
            if (!results) return null;

            return results.map((request: IAssistanceRequestResponse) => ({
                ...request,
                requestedDate: new Date(request.requestedDate).toISOString(),
                address: request.address instanceof Types.ObjectId ? undefined : request.address,
            }));
        } catch (error) {
            console.error("Error finding assistance requests:", error);
            return null;
        }
    }

    async countAssistanceRequests(search: string, filter: string, priority: string): Promise<number> {
        try {
            return await this.assistanceRepository.countAssistanceRequests(search, filter, priority);
        } catch (error) {
            console.error("Error counting assistance requests:", error);
            return 0;
        }
    }

    
    async countProcessingRequests(search: string, filter: string, volunteerId: string): Promise<number> {
        try {
            return await this.assistanceRepository.countProcessingRequests(search, filter, volunteerId);
        } catch (error) {
            console.error("Error counting assistance requests:", error);
            return 0;
        }
    }

    async fetchAssistanceRequestDetails(requestId: string): Promise<any> {
        try {
            return await this.assistanceRepository.findAssistanceRequestDetails(requestId);
        } catch (error) {
            console.error("Error fetching assistance request details:", error);
            return null;
        }
    }

    async checkTasksLimit(volunteerId: string): Promise<boolean | null> {
        try {
            return await this.assistanceRepository.checkTasksLimit(volunteerId);
        } catch (error) {
            console.error("Error checking volunteer task limit:", error);
            return null;
        }
    }

    async assignVolunteer(requestId: string, volunteerId: string): Promise<any> {
        try {
            return await this.assistanceRepository.assignVolunteer(requestId, volunteerId);
        } catch (error) {
            console.error("Error assigning volunteer:", error);
            return null;
        }
    }
}