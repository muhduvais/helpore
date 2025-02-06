import { AddAssetFormData, SignUpFormData, SignupResponse } from '../interfaces/authInterface';
import { customAxios } from '../utils/apiClient';

export const adminService = {

    addUser: async (formData: SignUpFormData) => {
        try {
            const response = await customAxios.post<SignupResponse>('/api/admin/users', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    addVolunteer: async (formData: SignUpFormData) => {
        try {
            const response = await customAxios.post<SignupResponse>('/api/admin/volunteers', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    addAsset: async (formData: AddAssetFormData) => {
        try {
            const response = await customAxios.post('/api/admin/assets', { formData })
            return response;
        } catch (error) {
            throw error
        }
    },
    uploadAssetImage: async (formData: any) => {
        try {
            const response = await customAxios.post('/api/admin/assetImage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssets: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get('/api/admin/assets', {
                params: {
                    page,
                    limit,
                    search
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssetDetails: async (assetId: string) => {
        try {
            const response = await customAxios.get(`/api/admin/assets/${assetId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    updateAsset: async (assetId: string, submitData: any) => {
        try {
            const response = await customAxios.put(`/api/admin/assets/${assetId}`, { submitData });
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchUsers: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get('/api/admin/users', {
                params: {
                    page,
                    limit,
                    search
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchUserDetails: async (userId: string) => {
        try {
            const response = await customAxios.get(`/api/admin/users/${userId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    userBlockToggle: async (userId: string, action: string) => {
        try {
            const response = await customAxios.patch(`/api/admin/users/${userId}/${action}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchVolunteers: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get('/api/admin/volunteers', {
                params: {
                    page,
                    limit,
                    search
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchVolunteerDetails: async (volunteerId: string) => {
        try {
            const response = await customAxios.get(`/api/admin/volunteers/${volunteerId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    volunteerBlockToggle: async (volunteerId: string, action: string) => {
        try {
            const response = await customAxios.patch(`/api/admin/volunteers/${volunteerId}/${action}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssetRequests: async (page: number, limit: number, search: string, status: string, priority: string, user: string, sort: string) => {
        try {
            const response = await customAxios.get('/api/admin/assetRequests', {
                params: {
                    page,
                    limit,
                    search,
                    status,
                    priority,
                    user,
                    sort,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    updateAssetRequestStatus: async (requestId: string, status: string, comment: string) => {
        try {
            console.log('reqId: ', requestId)
            const response = await customAxios.patch(`/api/admin/assetRequests/${requestId}`, { status, comment });
            return response;
        } catch (error) {
            throw error
        }
    },

}
