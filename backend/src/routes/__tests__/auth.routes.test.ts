import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../auth.routes';
import { hashPassword } from '../../utils/auth.utils';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock server.ts to return the mock PrismaClient
jest.mock('../../server', () => {
  const { PrismaClient } = require('@prisma/client');
  return {
    prisma: new PrismaClient(),
  };
});

// Mock token.utils.ts
jest.mock('../../utils/token.utils', () => ({
  generateToken: jest.fn(() => 'mock-token'),
  verifyToken: jest.fn(() => ({ userId: 'mock-user-id', role: 'CUSTOMER' })),
  extractTokenFromHeader: jest.fn((header) => header ? header.replace('Bearer ', '') : null),
}));

// Mock auth.utils.ts
jest.mock('../../utils/auth.utils', () => ({
  hashPassword: jest.fn(async () => 'hashed-password'),
  comparePassword: jest.fn(async () => true),
}));

describe('Auth Routes', () => {
  let app: express.Application;
  let prisma: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Get prisma mock
    prisma = require('../../server').prisma;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      // Mock user not found (for uniqueness check)
      prisma.user.findFirst.mockResolvedValue(null);
      
      // Mock user creation
      prisma.user.create.mockResolvedValue({
        id: 'mock-user-id',
        universityId: 'u123456',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CUSTOMER',
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          universityId: 'u123456',
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('universityId', 'u123456');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      
      // Verify hashPassword was called
      expect(hashPassword).toHaveBeenCalledWith('password123');
      
      // Verify user creation was called with correct data
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          universityId: 'u123456',
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashed-password',
          role: 'CUSTOMER',
        },
      });
    });
    
    it('should return 400 if user already exists', async () => {
      // Mock user found (for uniqueness check)
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        universityId: 'u123456',
        email: 'test@example.com',
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          universityId: 'u123456',
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
      
      // Verify user creation was not called
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          // Missing universityId
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      
      // Verify user creation was not called
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      // Mock user found
      prisma.user.findUnique.mockResolvedValue({
        id: 'mock-user-id',
        universityId: 'u123456',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        role: 'CUSTOMER',
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          universityId: 'u123456',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('universityId', 'u123456');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
    });
    
    it('should return 401 if user not found', async () => {
      // Mock user not found
      prisma.user.findUnique.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          universityId: 'u123456',
          password: 'password123',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
