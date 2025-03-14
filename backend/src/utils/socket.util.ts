import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const setupSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
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
        
        // Also emit a notification to the receiver
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

    socket.on('disconnect', () => {
      console.log('User disconnected with socket ID:', socket.id);
    });
  });

  return io;
};

export { io };