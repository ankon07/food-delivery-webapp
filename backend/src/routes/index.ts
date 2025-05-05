import express from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuItem.routes';
import orderRoutes from './order.routes';
import settingsRoutes from './settings.routes';
import paymentRoutes from './payment.routes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/settings', settingsRoutes);
router.use('/payments', paymentRoutes);

export default router;
