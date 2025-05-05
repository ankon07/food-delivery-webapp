import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// bKash payment routes
router.post('/bkash/create', authMiddleware.authenticate, paymentController.createPayment);
router.post('/bkash/callback', paymentController.handleBkashCallback);
router.get('/bkash/status/:paymentId', authMiddleware.authenticate, paymentController.checkBkashPaymentStatus);

export default router;
