import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server
 * @param httpServer - HTTP server instance
 */
export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room for user-specific updates
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join staff room for all staff members
    socket.on('join-staff-room', () => {
      socket.join('staff-room');
      console.log(`Staff member joined staff room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Get Socket.IO server instance
 * @returns Socket.IO server instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit new order event to staff room
 * @param order - Order data
 */
export const emitNewOrder = (order: any): void => {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot emit new order');
    return;
  }
  io.to('staff-room').emit('new-order', order);
};

/**
 * Emit order status update to user and staff rooms
 * @param order - Updated order data
 */
export const emitOrderStatusUpdate = (order: any): void => {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot emit order status update');
    return;
  }
  io.to(`user-${order.userId}`).emit('order-status-update', order);
  io.to('staff-room').emit('order-status-update', order);
};

/**
 * Emit payment status update to user and staff rooms
 * @param order - Updated order data
 */
export const emitPaymentStatusUpdate = (order: any): void => {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot emit payment status update');
    return;
  }
  io.to(`user-${order.userId}`).emit('payment-status-update', order);
  io.to('staff-room').emit('payment-status-update', order);
};

/**
 * Emit canteen status update to all connected clients
 * @param isOpen - Whether the canteen is open
 */
export const emitCanteenStatusUpdate = (isOpen: boolean): void => {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot emit canteen status update');
    return;
  }
  io.emit('canteen-status-update', { isOpen });
};
