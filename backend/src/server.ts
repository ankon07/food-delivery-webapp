import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import apiRoutes from './routes';
import { initializeSocketIO } from './utils/socket.utils';
import { mockPrismaClient } from './utils/prisma-mock';

// Load environment variables
dotenv.config();

// Check if we should use the mock Prisma client
const useMockPrisma = process.env.USE_MOCK_PRISMA === 'true' || process.env.NODE_ENV === 'test';

// Initialize Prisma client
export const prisma = useMockPrisma ? mockPrismaClient : new PrismaClient();

console.log(`Using ${useMockPrisma ? 'mock' : 'real'} Prisma client`);

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to University Canteen Food Ordering System API' });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});


// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});
