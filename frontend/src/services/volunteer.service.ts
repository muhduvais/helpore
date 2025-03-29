import { ChangePasswordData, IAddress } from '../interfaces/userInterface';
import { customAxios } from '../utils/apiClient';


export const volunteerService = {

    // Profile
    fetchVolunteerDetails: async (volunteerId: string) => {
        try {
            const response = await customAxios.get(`/api/volunteers/${volunteerId}`)
            return response;
        } catch (error) {
            console.log('Error fetching volunteer details: ', error)
            throw error
        }
    },
    updateVolunteer: async (formData: any) => {
        try {
            const response = await customAxios.put('/api/volunteers', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateProfilePicture: async (profilePicture: string) => {
        try {
            const response = await customAxios.patch('/api/volunteers/profilePicture', { profilePicture })
            return response;
        } catch (error) {
            throw error
        }
    },
    changePassword: async (data: ChangePasswordData) => {
        try {
            const response = await customAxios.patch('/api/volunteers/password', data)
            return response;
        } catch (error) {
            throw error
        }
    },

    // Addresses
    createAddress: async (addressData: IAddress) => {
        try {
            const createdAddressId = await customAxios.post('/api/addresses', { addressData });
            return createdAddressId;
        } catch (error) {
            throw error
        }
    },
    getVolunteerAddresses: async () => {
        try {
            const response = await customAxios.get('/api/addresses');
            console.log('addresses: ', response)
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assistance requests
    fetchAssistanceRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get('/api/assistanceRequests/nearBy', {
                params: {
                    page,
                    limit,
                    search,
                    filter
                }
            });
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchProcessingRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get('/api/assistanceRequests/processing', {
                params: {
                    page,
                    limit,
                    search,
                    filter
                }
            });
            return response;
        } catch (error) {
            throw error
        }
    },
    updateRequestStatus: async (requestId: string, action: string) => {
        try {
            const response = await customAxios.patch(`/api/assistanceRequests/${requestId}/status`, { action });
            return response;
        } catch (error) {
            throw error
        }
    },

    fetchAssistanceRequestDetails: async (requestId: string) => {
        try {
            const response = await customAxios.get(`/api/assistanceRequests/${requestId}`)
            return response;
        } catch (error) {
            throw error
        }
    },
}
