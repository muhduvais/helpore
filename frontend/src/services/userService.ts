import { ChangePasswordData, IAddress, IUser } from '../interfaces/userInterface';
import { customAxios } from '../utils/apiClient';


export const userService = {
    changePassword: async (data: ChangePasswordData) => {
        try {
            const response = await customAxios.patch('/api/user/password', data)
            return response;
        } catch (error) {
            throw error
        }
    },
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
    fetchAssets: async (page: number, limit: number, search: string, sortBy: string, filterByAvailability: string) => {
        try {
            const response = await customAxios.get('/api/user/assets', {
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
            const response = await customAxios.get(`/api/user/assets/${assetId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    requestAsset: async (assetId: string, requestedDate: object) => {
        try {
            const response = await customAxios.post(`/api/user/assetRequests/${assetId}`, requestedDate )
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssetRequests: async (page: number, limit: number, search: string, filter: string) => {
        try {
            const response = await customAxios.get('/api/user/assetRequests', {
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
    updateProfilePicture: async (profilePicture: string) => {
        try {
            const response = await customAxios.patch('/api/user/me', { profilePicture })
            return response;
        } catch (error) {
            throw error
        }
    },
}
