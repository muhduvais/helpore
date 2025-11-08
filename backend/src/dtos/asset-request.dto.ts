
export class AssetRequestDTO {
  id!: string;
  asset?: string;
  user?: string;
  requestedDate?: string;
  quantity?: number;
  comment?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt!: string;
  updatedAt!: string;
}
