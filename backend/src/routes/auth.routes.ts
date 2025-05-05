import express from 'express';
import * as authController from '../controllers/auth.controller';
import * as authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

export default router;
