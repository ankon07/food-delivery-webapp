import { Request, Response } from 'express';
import { prisma } from '../server';
import { emitNewOrder, emitOrderStatusUpdate, emitPaymentStatusUpdate } from '../utils/socket.utils';

interface OrderItemInput {
  menuItemId: string;
  quantity: number | string;
}

interface OrderItemCreate {
  menuItemId: string;
  quantity: number;
  priceAtOrderTime: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  [key: string]: any;
}

/**
 * Get all orders
 * @route GET /api/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get orders by user
 * @route GET /api/orders/user
 */
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get orders by user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single order by ID
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is authorized to view this order
    if (req.user?.role !== 'STAFF' && order.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new order
 * @route POST /api/orders
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { items, deliveryLocation, paymentMethod } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one item',
      });
    }

    if (!deliveryLocation) {
      return res.status(400).json({
        message: 'Please provide a delivery location',
      });
    }

    if (!paymentMethod || !['BKASH', 'CASH'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Please provide a valid payment method (BKASH or CASH)',
      });
    }

    // Get menu items
    const menuItemIds = items.map((item: OrderItemInput) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
    });

    // Check if all menu items exist and are available
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        message: 'One or more menu items not found',
      });
    }

    const unavailableItems = menuItems.filter((item: MenuItem) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: `The following items are not available: ${unavailableItems
          .map((item: MenuItem) => item.name)
          .join(', ')}`,
      });
    }

    // Create a map of menu items for easy access
    const menuItemMap = new Map<string, MenuItem>(
      menuItems.map((item: MenuItem) => [item.id, item])
    );

    // Calculate total amount
    let totalAmount = 0;
    const orderItems: OrderItemCreate[] = items.map((item: OrderItemInput) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }

      // Convert quantity to number if it's a string
      const quantity = typeof item.quantity === 'string' 
        ? parseInt(item.quantity) 
        : item.quantity;
        
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for menu item: ${menuItem.name}`);
      }

      const itemTotal = menuItem.price * quantity;
      totalAmount += itemTotal;

      return {
        menuItemId: menuItem.id,
        quantity: quantity,
        priceAtOrderTime: menuItem.price,
      };
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        deliveryLocation,
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
        status: 'PENDING',
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit new order event to staff
    emitNewOrder(order);

    // If payment method is bKash, initiate payment
    if (paymentMethod === 'BKASH') {
      // TODO: Implement bKash payment integration
      // For now, we'll just return the order
      return res.status(201).json({
        message: 'Order created successfully. Please complete payment.',
        order,
        // In a real implementation, we would return bKash payment URL here
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only staff can update order status
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status || !['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        message: 'Please provide a valid status',
      });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit order status update event
    emitOrderStatusUpdate(updatedOrder);

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update payment status
 * @route PATCH /api/orders/:id/payment
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only staff can update payment status
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { paymentStatus, bkashTransactionId } = req.body;

    // Validate input
    if (!paymentStatus || !['PENDING', 'COMPLETED', 'FAILED'].includes(paymentStatus)) {
      return res.status(400).json({
        message: 'Please provide a valid payment status',
      });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        bkashTransactionId: bkashTransactionId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit payment status update event
    emitPaymentStatusUpdate(updatedOrder);

    res.status(200).json({
      message: 'Payment status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Cancel order
 * @route PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to cancel this order
    if (req.user.role !== 'STAFF' && existingOrder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (['COMPLETED', 'CANCELLED'].includes(existingOrder.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already ${existingOrder.status.toLowerCase()}`,
      });
    }

    // Cancel order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            universityId: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit order status update event
    emitOrderStatusUpdate(updatedOrder);

    res.status(200).json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
