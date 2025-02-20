import { ChangePasswordData, IAddress, IUser } from '../interfaces/userInterface';
import { customAxios } from '../utils/apiClient';


export const volunteerService = {

    // Profile
    fetchUserDetails: async () => {
        try {
            const response = await customAxios.get('/api/user/me')
            console.log('response: ', response)
            return response;
        } catch (error) {
            throw error
        }
    },
    updateUser: async (formData: any) => {
        try {
            const response = await customAxios.put('/api/user/me', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateProfilePicture: async (profilePicture: string) => {
        try {
            const response = await customAxios.patch('/api/user/me', { profilePicture })
            return response;
        } catch (error) {
            throw error
        }
    },
    changePassword: async (data: ChangePasswordData) => {
        try {
            const response = await customAxios.patch('/api/user/password', data)
            return response;
        } catch (error) {
            throw error
        }
    },

    // Addresses
    createAddress: async (addressData: IAddress) => {
        try {
            const createdAddressId = await customAxios.post('/api/user/addresses', { addressData });
            return createdAddressId;
        } catch (error) {
            throw error
        }
    },
    getUserAddresses: async () => {
        try {
            const response = await customAxios.get('/api/user/addresses');
            console.log('addresses: ', response)
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assistance requests
    fetchAssistanceRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get('/api/volunteer/assistanceRequests', {
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
            const response = await customAxios.patch(`/api/volunteer/assistanceRequests/${requestId}`, { action });
            return response;
        } catch (error) {
            throw error
        }
    },

    fetchAssistanceRequestDetails: async (requestId: string) => {
        try {
            const response = await customAxios.get(`/api/user/assistanceRequests/${requestId}`)
            return response;
        } catch (error) {
            throw error
        }
    },
}
