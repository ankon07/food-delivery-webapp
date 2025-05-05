import express from 'express';
import * as categoryController from '../controllers/category.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (staff only)
router.post('/', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), categoryController.createCategory);
router.put('/:id', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), categoryController.updateCategory);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.authorize(['STAFF']), categoryController.deleteCategory);

export default router;
