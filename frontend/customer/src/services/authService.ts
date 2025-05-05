import { post, get } from './apiService';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/models';

/**
 * Register a new user
 * @param data - User registration data
 * @returns Authentication response with user and token
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await post<AuthResponse>('/auth/register', data);
  
  // Store token and user in localStorage
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  
  return response;
};

/**
 * Login a user
 * @param credentials - Login credentials
 * @returns Authentication response with user and token
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await post<AuthResponse>('/auth/login', credentials);
  
  // Store token and user in localStorage
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  
  return response;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get the current user
 * @returns Current user or null if not logged in
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Fetch the current user from the API
 * @returns Current user
 */
export const fetchCurrentUser = async (): Promise<User> => {
  const response = await get<{ user: User }>('/auth/me');
  
  // Update user in localStorage
  localStorage.setItem('user', JSON.stringify(response.user));
  
  return response.user;
};
