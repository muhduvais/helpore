import { injectable, inject } from "tsyringe";
import { IAssistanceRequestService } from "../services/interfaces/ServiceInterface";
import { IAssistanceRequest, IAssistanceRequestResponse } from "../interfaces/userInterface";
import { Types } from "mongoose";
import { IAddressRepository } from "../repositories/interfaces/IAddressRepository";
import { calculateDistance, GeocodingService, MAX_DISTANCE, MIN_DISTANCE } from '../utils/geoUtils';
import { IAssistanceRequestRepository } from "../repositories/interfaces/IAssistanceRequestRepository";

@injectable()
export class AssistanceRequestService implements IAssistanceRequestService {
    constructor(
        @inject('IAssistanceRequestRepository') private assistanceRepository: IAssistanceRequestRepository,
        @inject('IAddressRepository') private addressRepository: IAddressRepository,
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

    async getNearbyRequests(volunteerId: string, page: number, search: string, filter: string): Promise<any> {
        try {
            let query: any = {
                entity: volunteerId,
                type: 'volunteer',
                rejectedBy: { $nin: [volunteerId] }
            };
            console.log('query data: ', search, filter);

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

            if (!pendingRequests.length) {
                return [];
            }

            const nearbyRequests = pendingRequests
                .map(request => {
                    if (!request.address || !request.address.latitude || !request.address.longitude) {
                        console.warn(`Request ${request._id} has invalid address`);
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
                        ...request.toObject(),
                        distance: Number(distance.toFixed(1)),
                        estimatedTravelTime: this.assistanceRepository.calculateEstimatedTravelTime(distance)
                    };
                })
                .filter((request): request is NonNullable<typeof request> => request !== null)
                .sort((a, b) => a.distance - b.distance);

            return {
                requests: nearbyRequests,
                metadata: {
                    total: nearbyRequests.length,
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
            if (!request.rejectedBy.includes(volunteerId)) {
                request.rejectedBy.push(volunteerId);
            }
        }

        await this.assistanceRepository.updateRequest(request);
        return action === 'approve' ? 'Request approved' : 'Request rejected';
    }

    async fetchAssistanceRequests(
        search: string, filter: string, skip: number, limit: number, sort: string, priority: string
    ): Promise<IAssistanceRequest[] | null> {
        try {
            const results = await this.assistanceRepository.findAssistanceRequests(search, filter, skip, limit, sort, priority);

            if (!results) return null;

            return results.map((request: IAssistanceRequestResponse) => ({
                ...request,
                requestedDate: new Date(request.requestedDate),
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