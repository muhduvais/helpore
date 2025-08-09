import { customAxios } from '../utils/apiClient';
import { IMessageDocument } from '../interfaces/chatInterface';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export const chatService = {
  // Messages
  sendMessage: async (receiverId: string, content: string, requestId: string, senderType: 'users' | 'volunteers', receiverType: 'users' | 'volunteers') => {
    try {
      const response = await customAxios.post('/api/chats/messages', {
        receiverId,
        content,
        requestId,
        senderType,
        receiverType,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getConversationMessages: async (requestId: string) => {
    try {
      const response = await customAxios.get<{ messages: IMessageDocument[] }>(`/api/chats/conversations/${requestId}/messages`);
      console.log('messages response: ', response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Conversations
  getUserConversations: async () => {
    try {
      const response = await customAxios.get('/api/chats/conversations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  markConversationAsRead: async (conversationId: string) => {
    try {
      const response = await customAxios.put(`/api/chats/conversations/${conversationId}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  connectSocket: (token: string) => {
    const socket: Socket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error: any) => {
      console.error('Connection failed', error.message);
      if (error.message.includes("Authentication error")) {
        toast.error("Authentication failed!");
      }
    });

    return socket;
  },

  joinConversation: (socket: Socket, requestId: string) => {
    socket.emit('join-conversation', requestId);
  },

  leaveConversation: (socket: Socket, requestId: string) => {
    socket.emit('leave-conversation', requestId);
  },

  sendTypingStatus: (socket: Socket, requestId: string, isTyping: boolean) => {
    socket.emit('typing', { requestId, isTyping });
  },

  setupListeners: (
    socket: Socket,
    messageCallback: (message: IMessageDocument) => void,
    typingCallback: (data: { userId: string, isTyping: boolean }) => void,
    messagesReadCallback: (data: { userId: string }) => void
  ) => {
    socket.on('new-message', (message: IMessageDocument) => {
      console.log('Received new message:', message);
      messageCallback(message);
    })

    socket.on('user-typing', (data: any) => {
      typingCallback({
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('messagesReadUpdate', (data: any) => {
      messagesReadCallback({
        userId: data.userId,
      });
    });
  },

  disconnectSocket: (socket: Socket) => {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};