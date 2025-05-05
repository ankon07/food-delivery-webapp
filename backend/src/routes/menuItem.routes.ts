import express from 'express';
import * as menuItemController from '../controllers/menuItem.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', menuItemController.getAllMenuItems);
router.get('/category/:categoryId', menuItemController.getMenuItemsByCategory);
router.get('/:id', menuItemController.getMenuItemById);

// Protected routes (staff only)
router.post('/', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), menuItemController.createMenuItem);
router.put('/:id', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), menuItemController.updateMenuItem);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), menuItemController.deleteMenuItem);
router.patch('/:id/toggle-availability', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), menuItemController.toggleMenuItemAvailability);

export default router;
