import { get, post, patch } from './apiService';
import { CreateOrderData, Order } from '../types/models';

/**
 * Get all orders for the current user
 * @returns List of orders
 */
export const getUserOrders = async (): Promise<Order[]> => {
  const response = await get<{ orders: Order[] }>('/orders/user');
  return response.orders;
};

/**
 * Get an order by ID
 * @param id - Order ID
 * @returns Order
 */
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await get<{ order: Order }>(`/orders/${id}`);
  return response.order;
};

/**
 * Create a new order
 * @param data - Order data
 * @returns Created order
 */
export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  const response = await post<{ message: string; order: Order }>('/orders', data);
  return response.order;
};

/**
 * Cancel an order
 * @param id - Order ID
 * @returns Updated order
 */
export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await patch<{ message: string; order: Order }>(`/orders/${id}/cancel`);
  return response.order;
};

/**
 * Create a bKash payment for an order
 * @param orderId - Order ID
 * @returns Payment response with bKash URL
 */
export const createBkashPayment = async (orderId: string): Promise<{ paymentID: string; bkashURL: string }> => {
  const response = await post<{ message: string; paymentID: string; bkashURL: string }>(
    '/payments/bkash/create',
    { orderId }
  );
  return {
    paymentID: response.paymentID,
    bkashURL: response.bkashURL,
  };
};

/**
 * Check bKash payment status
 * @param paymentId - Payment ID
 * @returns Payment status
 */
export const checkBkashPaymentStatus = async (paymentId: string): Promise<string> => {
  const response = await get<{ message: string; paymentStatus: string }>(
    `/payments/bkash/status/${paymentId}`
  );
  return response.paymentStatus;
};
