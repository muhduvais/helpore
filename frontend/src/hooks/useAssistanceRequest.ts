import axios from "axios";
import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { IAssistanceRequest } from '@/interfaces/adminInterface';

export const useAssistanceRequest = (requestId: string | undefined) => {
  const [request, setRequest] = useState<IAssistanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const id = requestId || '';
        const response = await userService.fetchAssistanceRequestDetails(id);

        if (response.status === 200) {
          setRequest(response.data.requestDetails);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data.message || 'Error fetching request details');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  return { request, isLoading, error };
};