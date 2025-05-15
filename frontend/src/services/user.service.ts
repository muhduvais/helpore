import { IAsset, IAssistanceRequest } from '@/interfaces/adminInterface';
import { ChangePasswordData, IAddress, IAssetRequest, IUser } from '../interfaces/userInterface';
import { customAxios } from '../utils/apiClient';


export const userService = {

    // Profile
    fetchUserDetails: async () => {
        try {
            const response = await customAxios.get<{ user: IUser, address: IAddress }>('/api/users/me')
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchUserDetailsById: async (userId: string) => {
        try {
            const response = await customAxios.get(`/api/users/${userId}`);
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

    // Certificates
    uploadCertificateImage: async (formData: any) => {
        try {
            const response = await customAxios.post<{ certificateUrl: string }>('/api/users/certificate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            return response;
        } catch (error) {
            console.log('error: ', error)
            throw error
        }
    },

    deleteCertificate: async (certificateUrl: string) => {
        try {
            const response = await customAxios.delete('/api/users/certificate', {
                data: { certificateUrl }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Addresses
    createAddress: async (addressData: IAddress) => {
        try {
            const createdAddressId = await customAxios.post<{ _id: string }>('/api/addresses', { addressData });
            return createdAddressId;
        } catch (error) {
            throw error
        }
    },
    getUserAddresses: async () => {
        try {
            const response = await customAxios.get<{ addresses: IAddress[] }>('/api/addresses');
            console.log('addresses: ', response)
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assets
    fetchAssets: async (page: number, limit: number, search: string, sortBy: string, filterByAvailability: string) => {
        try {
            const response = await customAxios.get<{ assets: IAsset[], totalPages: number }>('/api/assets', {
                params: {
                    page,
                    limit,
                    search,
                    sortBy,
                    filterByAvailability,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssetDetails: async (assetId: string) => {
        try {
            const response = await customAxios.get<{ asset: IAsset }>(`/api/assets/${assetId}`);
            return response;
        } catch (error) {
            throw error
        }
    },

    // Asset requests
    requestAsset: async (assetId: string, requestedDate: object) => {
        try {
            const response = await customAxios.post(`/api/assetRequests/${assetId}`, requestedDate)
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchMyAssetRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get<{ assetRequests: IAssetRequest[], totalPages: number, totalRequests: number }>('/api/assetRequests/me', {
                params: {
                    page,
                    limit,
                    search,
                    filter
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssetRequestDetails: async (assetId: string) => {
        try {
            const response = await customAxios.get<{ assetRequestDetails: IAssetRequest[] }>(`/api/assetRequests/${assetId}`);
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assistance requests
    requestAssistance: async (formData: object) => {
        try {
            const response = await customAxios.post(`/api/assistanceRequests`, { formData })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssistanceRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get('/api/assistanceRequests', {
                params: {
                    page,
                    limit,
                    search,
                    filter
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchMyAssistanceRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get<{ assistanceRequests: IAssistanceRequest[], totalPages: number, totalRequests: number }>('/api/assistanceRequests/me', {
                params: {
                    page,
                    limit,
                    search,
                    filter
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssistanceRequestDetails: async (requestId: string) => {
        try {
            const response = await customAxios.get<{ requestDetails: IAssistanceRequest }>(`/api/assistanceRequests/${requestId}`)
            return response;
        } catch (error) {
            throw error
        }
    },
}
