import express from 'express';
import * as settingsController from '../controllers/settings.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', settingsController.getSettings);

// Protected routes (staff only)
router.put('/', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), settingsController.updateSettings);
router.patch('/toggle', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), settingsController.toggleCanteenStatus);

export default router;
