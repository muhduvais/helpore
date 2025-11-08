
export class MessageDTO {
  id!: string;
  sender!: string;
  senderType!: 'users' | 'volunteers';
  receiver!: string;
  receiverType!: 'users' | 'volunteers';
  content?: string;
  read!: boolean;
  requestId!: string;
  conversationId?: string;
  media!: string[];
  createdAt!: string;
  updatedAt!: string;
}
