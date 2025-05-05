// This file is executed before running tests
// It can be used to set up global test environment, mocks, etc.

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock console.error to avoid cluttering test output
console.error = jest.fn();

// Mock console.warn to avoid cluttering test output
console.warn = jest.fn();
