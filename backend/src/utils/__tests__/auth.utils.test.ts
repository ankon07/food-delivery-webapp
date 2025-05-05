import { hashPassword, comparePassword, generateRandomToken } from '../auth.utils';

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      // Hashed password should be different from original
      expect(hashedPassword).not.toBe(password);
      
      // Hashed password should be a string
      expect(typeof hashedPassword).toBe('string');
      
      // Hashed password should be longer than original (due to salt)
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });
    
    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hashedPassword1 = await hashPassword(password);
      const hashedPassword2 = await hashPassword(password);
      
      // Two hashes of the same password should be different (due to different salts)
      expect(hashedPassword1).not.toBe(hashedPassword2);
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });
    
    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
  
  describe('generateRandomToken', () => {
    it('should generate a token of the specified length', () => {
      const length = 32;
      const token = generateRandomToken(length);
      
      expect(token.length).toBe(length);
    });
    
    it('should generate a token of default length if no length is specified', () => {
      const token = generateRandomToken();
      
      // Default length is 32
      expect(token.length).toBe(32);
    });
    
    it('should generate different tokens on subsequent calls', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      
      expect(token1).not.toBe(token2);
    });
    
    it('should only contain alphanumeric characters', () => {
      const token = generateRandomToken();
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      
      expect(alphanumericRegex.test(token)).toBe(true);
    });
  });
});
