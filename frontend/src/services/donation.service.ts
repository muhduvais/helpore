import { IDonation } from '@/interfaces/donation.interface';
import { customAxios } from '../utils/apiClient';

interface CheckoutSessionParams {
  amount: number;
  campaign: string;
  message?: string;
  isAnonymous: boolean;
}

interface IDonationsResponse {
  donations: IDonation[];
}

export const donationService = {
  fetchDonationHistory: async () => {
    return await customAxios.get<IDonation[]>('/api/donations/history');
  },

  fetchRecentDonations: async () => {
    return await customAxios.get<IDonationsResponse>('/api/donations/recent');
  },

  createCheckoutSession: async (params: CheckoutSessionParams) => {
    return await customAxios.post<{ checkoutUrl: string }>('/api/donations/create-checkout-session', params);
  },

  verifyCheckoutSession: async (sessionId: string) => {
    return await customAxios.get(`/api/donations/verify-session?sessionId=${sessionId}`);
  },

  getDonationStats: async () => {
    return await customAxios.get('/api/donations/stats');
  },

  downloadDonationReceipt: async (donationId: string, userId: string | null): Promise<void> => {
    try {
      const response = await customAxios.get(`/api/donations/receipt/${donationId}`,
        {
          params: {
            userId,
          },
          responseType: 'arraybuffer',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/pdf'
          }
        });

      const contentType = response.headers['content-type'];

      if (contentType && contentType.includes('application/json')) {
        const jsonData = JSON.parse(new TextDecoder().decode(response.data));
        console.error('Server returned an error:', jsonData);
        throw new Error(jsonData.message || 'Error downloading receipt');
      } else {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `donation_receipt_${donationId}_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      console.log('error: ', error)
      throw error;
    }
  }
};