import { Request, Response } from 'express';
import { prisma } from '../server';
import { createBkashPayment as initBkashPayment, executeBkashPayment, queryBkashPayment } from '../utils/bkash.utils';
import { emitPaymentStatusUpdate } from '../utils/socket.utils';

/**
 * Handle bKash payment callback
 * @route POST /api/payments/bkash/callback
 */
export const handleBkashCallback = async (req: Request, res: Response) => {
  try {
    const { paymentID, status } = req.body;

    if (!paymentID) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    // Find order with this payment ID
    const order = await prisma.order.findFirst({
      where: {
        bkashTransactionId: paymentID,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If payment is successful, execute payment and update order
    if (status === 'success') {
      try {
        // Execute payment
        const executeResponse = await executeBkashPayment(paymentID);

        // Update order
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            bkashTransactionId: executeResponse.trxID,
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

        // Emit payment status update
        emitPaymentStatusUpdate(updatedOrder);

        return res.status(200).json({
          message: 'Payment successful',
          order: updatedOrder,
        });
      } catch (error) {
        console.error('Error executing bKash payment:', error);

        // Update order with failed payment status
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
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

        // Emit payment status update
        emitPaymentStatusUpdate(updatedOrder);

        return res.status(500).json({
          message: 'Payment failed',
          error: 'Failed to execute payment',
        });
      }
    } else {
      // Update order with failed payment status
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
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

      // Emit payment status update
      emitPaymentStatusUpdate(updatedOrder);

      return res.status(400).json({
        message: 'Payment failed',
        error: 'Payment was not successful',
      });
    }
  } catch (error) {
    console.error('bKash callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create bKash payment
 * @route POST /api/payments/bkash/create
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to create payment for this order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if payment method is bKash
    if (order.paymentMethod !== 'BKASH') {
      return res.status(400).json({
        message: 'Payment method is not bKash',
      });
    }

    // Check if payment is already completed
    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        message: 'Payment is already completed',
      });
    }

    // Create bKash payment
    const paymentResponse = await initBkashPayment(
      order.totalAmount,
      order.id
    );

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        bkashTransactionId: paymentResponse.paymentID,
      },
    });

    // Return payment URL
    res.status(200).json({
      message: 'Payment initiated',
      paymentID: paymentResponse.paymentID,
      bkashURL: paymentResponse.bkashURL,
    });
  } catch (error) {
    console.error('Create bKash payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Check bKash payment status
 * @route GET /api/payments/bkash/status/:paymentId
 */
export const checkBkashPaymentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    // Find order with this payment ID
    const order = await prisma.order.findFirst({
      where: {
        bkashTransactionId: paymentId,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to check payment status for this order
    if (req.user.role !== 'STAFF' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Query payment status
    const paymentResponse = await queryBkashPayment(paymentId);

    // Return payment status
    res.status(200).json({
      message: 'Payment status retrieved',
      paymentStatus: paymentResponse.transactionStatus,
    });
  } catch (error) {
    console.error('Check bKash payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
