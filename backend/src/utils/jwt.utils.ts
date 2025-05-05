import jwt from 'jsonwebtoken';
import config from '../config/config';

interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

/**
 * Generate JWT token
 * @param payload - Data to be included in the token
 * @returns JWT token
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from authorization header
 * @param authHeader - Authorization header
 * @returns Token or null if not found
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
