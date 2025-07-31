import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Token management utilities
export const tokenUtils = {
  // Store token and user data with expiration
  setToken: (token: string, user: any) => {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());
  },

  // Get token if valid
  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return null;
    }
    
    const expirationDate = new Date(expiration);
    if (new Date() > expirationDate) {
      tokenUtils.clearToken();
      return null;
    }
    
    return token;
  },

  // Get user data
  getUser: (): any | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenUtils.getToken() !== null;
  },

  // Clear token and user data
  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
  },

  // Get auth headers for API requests
  getAuthHeaders: (): HeadersInit => {
    const token = tokenUtils.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
};
