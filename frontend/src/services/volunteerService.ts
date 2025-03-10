import { ChangePasswordData, IAddress, IUser } from '../interfaces/userInterface';
import { customAxios } from '../utils/apiClient';


export const volunteerService = {

    // Profile
    fetchUserDetails: async () => {
        try {
            const response = await customAxios.get('/api/users')
            return response;
        } catch (error) {
            throw error
        }
    },
    updateUser: async (formData: any) => {
        try {
            const response = await customAxios.put('/api/users', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateProfilePicture: async (profilePicture: string) => {
        try {
            const response = await customAxios.patch('/api/users/profilePicture', { profilePicture })
            return response;
        } catch (error) {
            throw error
        }
    },
    changePassword: async (data: ChangePasswordData) => {
        try {
            const response = await customAxios.patch('/api/users/password', data)
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
    getUserAddresses: async () => {
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
