import { IAssistanceRequest } from '@/interfaces/adminInterface';

export const useRequestHistory = (request: IAssistanceRequest) => {
  const history = [
    {
      date: new Date().toISOString(),
      action: 'Status Update',
      details: `Request ${request.status}`,
    },
    {
      date: request.createdAt,
      action: 'Request Created',
      details: 'Assistance request submitted',
    },
  ];

  return history;
};
