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

    socket.on('join-conversation', (requestId: string) => {
      socket.join(`request-${requestId}`);
      console.log(`User with socket ID ${socket.id} joined conversation for request ${requestId}`);
    });

    socket.on('send-message', (messageData: any) => {
      try {
        socket.to(messageData.receiverId).emit('new-message', messageData);
        socket.to(`request-${messageData.requestId}`).emit('new-message', messageData);
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