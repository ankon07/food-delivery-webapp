import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Order } from '../types/models';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  orderUpdates: Order[];
  clearOrderUpdates: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [orderUpdates, setOrderUpdates] = useState<Order[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io({
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join user-specific room when authenticated
  useEffect(() => {
    if (socket && isConnected && isAuthenticated && user) {
      console.log('Joining user room:', user.id);
      socket.emit('join-user-room', user.id);

      // Listen for order status updates
      socket.on('order-status-update', (updatedOrder: Order) => {
        console.log('Order status update received:', updatedOrder);
        setOrderUpdates((prev) => {
          // Check if this order is already in the updates
          const exists = prev.some((order) => order.id === updatedOrder.id);
          if (exists) {
            // Replace the existing order with the updated one
            return prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
          } else {
            // Add the new order update
            return [...prev, updatedOrder];
          }
        });
      });

      // Listen for payment status updates
      socket.on('payment-status-update', (updatedOrder: Order) => {
        console.log('Payment status update received:', updatedOrder);
        setOrderUpdates((prev) => {
          // Check if this order is already in the updates
          const exists = prev.some((order) => order.id === updatedOrder.id);
          if (exists) {
            // Replace the existing order with the updated one
            return prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
          } else {
            // Add the new order update
            return [...prev, updatedOrder];
          }
        });
      });

      return () => {
        socket.off('order-status-update');
        socket.off('payment-status-update');
      };
    }
  }, [socket, isConnected, isAuthenticated, user]);

  const clearOrderUpdates = () => {
    setOrderUpdates([]);
  };

  const value = {
    socket,
    isConnected,
    orderUpdates,
    clearOrderUpdates,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
