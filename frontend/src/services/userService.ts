import { ChangePasswordData } from '../interfaces/userInterface';
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
            return response;
        } catch (error) {
            throw error
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
    fetchAssetRequests: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get('/api/user/assetRequests', {
                params: {
                    page,
                    limit,
                    search,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
}
