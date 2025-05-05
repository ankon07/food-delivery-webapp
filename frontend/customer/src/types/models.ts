// User related types
export interface User {
  id: string;
  universityId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  universityId: string;
  password: string;
}

export interface RegisterData {
  universityId: string;
  email: string;
  name: string;
  password: string;
}

// Menu related types
export interface MenuCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  categoryId: string;
  category?: MenuCategory;
  createdAt: string;
  updatedAt: string;
}

// Order related types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'BKASH' | 'CASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  priceAtOrderTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  totalAmount: number;
  deliveryLocation: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bkashTransactionId?: string | null;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: {
    menuItemId: string;
    quantity: number;
  }[];
  deliveryLocation: string;
  paymentMethod: PaymentMethod;
}

// Cart related types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// Settings related types
export interface CanteenSettings {
  id: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment related types
export interface BkashPaymentResponse {
  message: string;
  paymentID: string;
  bkashURL: string;
}

export interface BkashPaymentStatusResponse {
  message: string;
  paymentStatus: string;
}
