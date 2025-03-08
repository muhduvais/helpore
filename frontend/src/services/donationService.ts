import axios from 'axios';
import { customAxios } from '../utils/apiClient';
import { saveAs } from 'file-saver';

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
    },

    downloadDonationReceipt: async (donationId: string): Promise<void> => {
      try {
        const response = await customAxios.get(`/api/donations/receipt/${donationId}`, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
    
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `donation_receipt_${donationId}_${new Date().toISOString().split('T')[0]}.pdf`;
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        window.URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Error downloading receipt:', error);
        throw error;
      }
    }
  };