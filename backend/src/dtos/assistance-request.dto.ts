export class AssistanceRequestDTO {
  id!: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    profilePicture: string;
  };
  type!: 'volunteer' | 'ambulance';
  description?: string;
  status!: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedDate!: string;
  requestedTime!: string;
  priority!: 'urgent' | 'normal';
  address?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
  volunteer?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    profilePicture: string;
  };
  rejectedBy?: string[];
  createdAt!: string;
  updatedAt!: string;
}
