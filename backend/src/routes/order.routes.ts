import express from 'express';
import * as orderController from '../controllers/order.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Protected routes (all users)
router.get('/user', authMiddleware.authenticate, orderController.getOrdersByUser);
router.get('/:id', authMiddleware.authenticate, orderController.getOrderById);
router.post('/', authMiddleware.authenticate, orderController.createOrder);
router.patch('/:id/cancel', authMiddleware.authenticate, orderController.cancelOrder);

// Protected routes (staff only)
router.get('/', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), orderController.getAllOrders);
router.patch('/:id/status', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), orderController.updateOrderStatus);
router.patch('/:id/payment', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), orderController.updatePaymentStatus);

export default router;
