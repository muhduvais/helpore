import { Server } from 'socket.io';
import http from 'http';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import Message from '../models/message.model';
dotenv.config();

let io: Server;

export const setupSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || '*', process.env.SERVER_URL || '*'],
    },
  });

  io.on('connection', (socket: any) => {
    console.log('User connected with socket ID:', socket.id);

    socket.join(socket.id);

    // Join notification room
    socket.on('join-notification-room', (userId: string) => {
      socket.join(`notification-${userId}`);
      console.log(`User with socket ID ${socket.id} joined notification room for user ${userId}`);
    });

    socket.on('join-conversation', (requestId: string) => {
      socket.join(`request-${requestId}`);
      console.log(`User with socket ID ${socket.id} joined conversation for request ${requestId}`);
    });

    socket.on('send-message', (messageData: any) => {
      console.log('Emitting the event')
      try {
        // Emit to the conversation room
        socket.to(`request-${messageData.requestId}`).emit('new-message', messageData);

        // Emit a notification to the receiver
        socket.to(`notification-${messageData.receiverId}`).emit('new-notification', {
          type: 'message',
          content: messageData.content,
          read: false,
          requestId: messageData.requestId,
          senderId: messageData.sender
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data: any) => {
      socket.to(`request-${data.requestId}`).emit('user-typing', {
        userId: socket.id,
        isTyping: data.isTyping,
      });
    });

    socket.on('messagesRead', async (conversationId: string) => {
      try {
        await Message.updateMany(
          {
            requestId: conversationId,
            read: false,
          },
          { $set: { read: true } }
        );  

        socket.to(`request-${conversationId}`).emit('messagesReadUpdate', {
          userId: socket.id,
        });
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected with socket ID:', socket.id);
    });
  });

  return io;
};

export { io };