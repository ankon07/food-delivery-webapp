import { generateToken, verifyToken, extractTokenFromHeader } from '../token.utils';
import config from '../../config/config';

describe('Token Utilities', () => {
  const mockPayload = {
    userId: '123',
    role: 'CUSTOMER',
  };

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const token = generateToken(mockPayload);
      
      // Token should be a string
      expect(typeof token).toBe('string');
      
      // Token should have three parts (header, payload, signature)
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });
  });
  
  describe('verifyToken', () => {
    it('should verify a valid token and return the payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      // Decoded should not be null
      expect(decoded).not.toBeNull();
      
      // Decoded should contain the original payload data
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.role).toBe(mockPayload.role);
    });
    
    it('should return null for an invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });
  });
  
  describe('extractTokenFromHeader', () => {
    it('should extract token from a valid authorization header', () => {
      const token = 'valid-token';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });
    
    it('should return null if authorization header is missing', () => {
      const extractedToken = extractTokenFromHeader(undefined);
      expect(extractedToken).toBeNull();
    });
    
    it('should return null if authorization header does not start with "Bearer "', () => {
      const token = 'valid-token';
      const authHeader = `Token ${token}`;
      
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBeNull();
    });
  });
});
