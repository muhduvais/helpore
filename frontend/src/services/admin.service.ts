import { UploadAssetImageResponse } from '@/components/AdminEditAsset';
import { AddAssetFormData, SignUpFormData, SignupResponse } from '../interfaces/authInterface';
import { customAxios } from '../utils/apiClient';
import { IAsset, IAssistanceRequest } from '@/interfaces/adminInterface';
import { IVolunteer } from '@/components/AssignVolunteerModal';
import { IAddress, IAssetRequest, IUser } from '@/interfaces/userInterface';
import { IDonation } from '@/interfaces/donation.interface';

interface IAssetResponse {
    asset: IAsset
}

interface IAssetsResponse {
    assets: IAsset[];
    totalPages: number;
}

interface IVolunteerResponse {
    volunteers: IVolunteer[]
}

interface IAssistanceRequestDetailsResponse {
    requestDetails: IAssistanceRequest | null;
}

interface IUserResponse {
    user: IUser;
    address?: IAddress;
}

interface IUsersResponse {
    users: IUser[] | null;
    totalPages: number;
    totalUsers: number;
}

interface IVolunteersResponse {
    volunteers: IVolunteer[] | null;
    totalPages: number;
    totalVolunteers: number;
}

interface IAssistanceRequestResponse {
    pendingRequests: IAssistanceRequest[];
}

interface IAssistanceRequestsResponse {
    assistanceRequests: IAssistanceRequest[];
    totalPages?: number;
    totalRequests?: number;
}

interface IAssetRequestsResponse {
    assetRequests: IAssetRequest[];
    totalPages?: number;
    totalRequests?: number;
}

interface IDonationsResponse {
    donations: IDonation[];
    totalPages: number;
    totalItems: number;
}

interface IVolunteerDetailsResponse {
    volunteer: IVolunteer;
}

export const adminService = {

    // Users
    addUser: async (formData: SignUpFormData) => {
        try {
            const response = await customAxios.post<SignupResponse>('/api/users', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    fetchUsers: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get<IUsersResponse>('/api/users', {
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
            const response = await customAxios.get<IUserResponse>(`/api/users/${userId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    userBlockToggle: async (userId: string, action: string) => {
        try {
            const response = await customAxios.patch(`/api/users/${userId}/${action}`);
            return response;
        } catch (error) {
            throw error
        }
    },

    // Volunteers
    addVolunteer: async (formData: SignUpFormData) => {
        try {
            const response = await customAxios.post<SignupResponse>('/api/volunteers', { formData });
            return response;
        } catch (error) {
            throw error;
        }
    },
    fetchVolunteers: async (page: number, limit: number, search: string) => {
        try {
            const response = await customAxios.get<IVolunteersResponse>('/api/volunteers', {
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
    fetchVolunteersList: async (page: number, search: string, isActive: boolean) => {
        try {
            const response = await customAxios.get<IVolunteerResponse>('/api/volunteers', {
                params: {
                    page,
                    search,
                    isActive,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchVolunteerDetails: async (volunteerId: string) => {
        try {
            const response = await customAxios.get<IVolunteerDetailsResponse>(`/api/volunteers/${volunteerId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    volunteerBlockToggle: async (volunteerId: string, action: string) => {
        try {
            const response = await customAxios.patch(`/api/volunteers/${volunteerId}/${action}`);
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assets
    addAsset: async (formData: AddAssetFormData) => {
        try {
            const response = await customAxios.post('/api/assets', { formData })
            return response;
        } catch (error) {
            throw error
        }
    },
    uploadAssetImage: async (formData: any) => {
        try {
            const response = await customAxios.post<UploadAssetImageResponse>('/api/assets/image', formData, {
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
            const response = await customAxios.get<IAssetsResponse>('/api/assets', {
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
            const response = await customAxios.get<IAssetResponse>(`/api/assets/${assetId}`);
            return response;
        } catch (error) {
            throw error
        }
    },
    updateAsset: async (assetId: string, submitData: any) => {
        try {
            const response = await customAxios.put<IAssetResponse>(`/api/assets/${assetId}`, { submitData });
            return response;
        } catch (error) {
            throw error
        }
    },

    // Asset requests
    fetchAssetRequests: async (page: number, limit: number, search: string, status: string, priority: string, user: string, sort: string) => {
        try {
            const response = await customAxios.get<IAssetRequestsResponse>('/api/assetRequests', {
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
            const response = await customAxios.patch(`/api/assetRequests/${requestId}`, { status, comment });
            return response;
        } catch (error) {
            throw error
        }
    },

    // Assistance requests
    fetchAssistanceRequests: async (page: number, limit: number, search: string, filter: string, priority: string, sort: string,) => {
        try {
            const response = await customAxios.get<IAssistanceRequestsResponse>('/api/assistanceRequests', {
                params: {
                    page,
                    limit,
                    search,
                    filter,
                    priority,
                    sort
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchPendingAssistanceRequests: async () => {
        try {
            const response = await customAxios.get<IAssistanceRequestResponse>('/api/assistanceRequests/pending');
            return response;
        } catch (error) {
            throw error
        }
    },
    fetchAssistanceRequestDetails: async (requestId: string) => {
        try {
            const response = await customAxios.get<IAssistanceRequestDetailsResponse>(`/api/assistanceRequests/${requestId}`)
            return response;
        } catch (error) {
            throw error
        }
    },
    updateAssistanceRequestStatus: async (requestId: string, status: string) => {
        try {
            const response = await customAxios.patch(`/api/assistanceRequests/${requestId}/status`, { action: status });
            return response;
        } catch (error) {
            throw error
        }
    },
    assignVolunteer: async (requestId: string, volunteerId: string) => {
        try {
            const response = await customAxios.patch(`/api/assistanceRequests/${requestId}/assignVolunteer`, { volunteerId })
            return response;
        } catch (error) {
            throw error
        }
    },

    // Donations
    fetchAllDonations: async (search: string, filter: string, page: number) => {
        try {
            const response = await customAxios.get<IDonationsResponse>(`/api/donations`, {
                params: {
                    search,
                    filter,
                    page,
                }
            });
            return response;
        } catch (error) {
            throw error
        }
    },

    exportDonations: async (search: string, filter: string, page: number) => {
        try {
            const response = await customAxios.get<Blob>(`/api/donations`, {
                responseType: 'blob',
                params: {
                    search,
                    filter,
                    page,
                }
            });
            return response;
        } catch (error) {
            throw error
        }
    },

}
