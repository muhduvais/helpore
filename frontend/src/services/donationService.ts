import { customAxios } from '../utils/apiClient';

interface CheckoutSessionParams {
    amount: number;
    campaign: string;
    message?: string;
    isAnonymous: boolean;
  }
  
  export const donationService = {
    fetchDonationHistory: async () => {
      return await customAxios.get('/api/donations/history');
    },
    
    createCheckoutSession: async (params: CheckoutSessionParams) => {
      return await customAxios.post('/api/donations/create-checkout-session', params);
    },
    
    verifyCheckoutSession: async (sessionId: string) => {
      return await customAxios.get(`/api/donations/verify-session?sessionId=${sessionId}`);
    },
    
    getDonationStats: async () => {
      return await customAxios.get('/api/donations/stats');
    }
  };