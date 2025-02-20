import { IAddress, IAsset, IAssetRequest, IAssetRequestResponse, IAssistanceRequest, IAssistanceRequestResponse, IUser } from '../interfaces/userInterface';
import VolunteerRepository from '../repositories/volunteerRepository';
import bcrypt from 'bcryptjs';
import { calculateDistance, GeocodingService, MAX_DISTANCE, MIN_DISTANCE } from '../utils/geoUtils';

type RequestAction = 'approve' | 'reject';

interface UpdateRequestParams {
    requestId: string;
    volunteerId: string;
    action: RequestAction;
    reason?: string;
}

class VolunteerService {
    private volunteerRepository: VolunteerRepository;
    private geocodingService: GeocodingService;

    constructor() {
        this.volunteerRepository = new VolunteerRepository();
        this.geocodingService = new GeocodingService();
    }

    async getNearbyRequests(volunteerId: string, page: number, search: string, filter: string) {
        try {
            let query: any = {
                entity: volunteerId,
                type: 'volunteer',
                rejectedBy: { $nin: [volunteerId] }
            };
            console.log('query data: ', search, filter);

            const volunteerAddress = await this.volunteerRepository.findVolunteerAddress(query);

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

            const pendingRequests = await this.volunteerRepository.findPendingRequests(requestQuery, skip);

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
                        estimatedTravelTime: this.calculateEstimatedTravelTime(distance)
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

    async countRequests(search: string, filter: string): Promise<number> {
        try {
            let query: any = {
                status: 'pending',
                volunteer: null,
            };

            if (filter) query.volunteerType = filter;
            if (search) query.description = { $regex: search, $options: 'i' };
            return await this.volunteerRepository.countRequests(query);
        } catch (error) {
            console.error('Error counting the requests:', error);
            return 0;
        }
    }

    calculateEstimatedTravelTime(distanceInKm: number): string {

        const timeInHours = distanceInKm / 30;
        const timeInMinutes = Math.round(timeInHours * 60);

        if (timeInMinutes < 60) {
            return `${timeInMinutes} minutes`;
        }

        const hours = Math.floor(timeInHours);
        const minutes = Math.round((timeInHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    }

    async updateRequestStatus({ requestId, volunteerId, action }: UpdateRequestParams) {
        const request = await this.volunteerRepository.findRequestById(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Request is no longer available');
        }

        if (action === 'approve') {
            request.volunteer = volunteerId;
            request.status = 'approved';
            await this.volunteerRepository.incrementVolunteerTasks(volunteerId);
        }

        if (action === 'reject') {
            if (!request.rejectedBy.includes(volunteerId)) {
                request.rejectedBy.push(volunteerId);
            }
        }

        await this.volunteerRepository.updateRequest(request);
        return action === 'approve' ? 'Request approved' : 'Request rejected';
    }

    // Profle
    async fetchUserDetails(volunteerId: string): Promise<any> {
        try {
            const user = await this.volunteerRepository.findUserDetails(volunteerId);
            const address = await this.volunteerRepository.findAddressDetails(volunteerId);
            return { user, address };
        } catch (error) {
            console.error('Error fetching the user details: ', error);
            return null;
        }
    }

    async editUser(volunteerId: string, formData: any) {
        try {
            const { name, age, gender, phone, fname, lname, street, city, state, country, pincode } = formData;

            const newUser: Partial<IUser> = {
                name,
                age,
                gender,
                phone,
            };

            const newAddress: IAddress = {
                fname,
                lname,
                street,
                city,
                state,
                country,
                pincode,
            };

            const user = await this.volunteerRepository.updateUser(volunteerId, newUser);
            await this.volunteerRepository.updateAddress(user._id as string, newAddress);
            const registeredMail = user.email;

            return registeredMail;
        } catch (error) {
            console.error('Error registering the user', error);
            return null;
        }
    }

    async changeProfilePicture(volunteerId: string, profilePicture: string): Promise<any> {
        try {
            await this.volunteerRepository.updateProfilePicture(volunteerId, profilePicture);
            return true;
        } catch (error) {
            console.error('Error updating the profile picture: ', error);
            return false;
        }
    }

    async verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<any> {
        try {
            const password = await this.volunteerRepository.findPassword(volunteerId);
            return bcrypt.compare(currentPassword, password);
        } catch (error) {
            console.error('Error updating the password: ', error);
            return null;
        }
    }

    async changePassword(volunteerId: string, newPassword: string): Promise<any> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.volunteerRepository.updatePassword(volunteerId, hashedPassword);
            return true;
        } catch (error) {
            console.error('Error updating the password: ', error);
            return false;
        }
    }

    // Addresses
    async createAddress(addressData: IAddress): Promise<string> {
        try {
            const addressDetails = {
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                country: addressData.country,
                pincode: addressData.pincode,
            }

            const coordinates = await this.geocodingService.geocodeAddress(addressDetails);

            const addressWithCoordinates = {
                ...addressData,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            };

            const newAddress = await this.volunteerRepository.createAddress(addressWithCoordinates);
            return newAddress._id;
        } catch (error) {
            console.error('Error creating the address: ', error);
            return null;
        }
    }

    async fetchAddresses(volunteerId: string): Promise<IAddress[]> {
        try {
            return await this.volunteerRepository.findAddresses(volunteerId);
        } catch (error) {
            console.error('Error fetching the addresses: ', error);
            return null;
        }
    }
}

export default VolunteerService;
