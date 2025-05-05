import { Request, Response } from 'express';
import { prisma } from '../server';
import { hashPassword, comparePassword } from '../utils/auth.utils';
import { generateToken } from '../utils/token.utils';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { universityId, email, name, password } = req.body;

    // Validate input
    if (!universityId || !email || !name || !password) {
      return res.status(400).json({
        message: 'Please provide universityId, email, name, and password',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { universityId },
          { email },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this university ID or email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        universityId,
        email,
        name,
        passwordHash: hashedPassword,
        role: 'CUSTOMER', // Default role is CUSTOMER
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        universityId: user.universityId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { universityId, password } = req.body;

    // Validate input
    if (!universityId || !password) {
      return res.status(400).json({
        message: 'Please provide universityId and password',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { universityId },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        universityId: user.universityId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.status(200).json({
      user: {
        id: user.id,
        universityId: user.universityId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
