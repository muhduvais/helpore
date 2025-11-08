
export class ConversationDTO {
  id!: string;
  participants!: string[];
  participantType!: 'users' | 'volunteers';
  requestId!: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt!: string;
  updatedAt!: string;
}
