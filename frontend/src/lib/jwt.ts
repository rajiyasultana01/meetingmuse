/**
 * JWT Token Management Utilities
 *
 * This file provides utilities for managing JWT tokens
 * in the MeetingMind application.
 */

export interface JWTTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Get the current JWT access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Get the current JWT refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * Store JWT tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Clear all JWT tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if user is authenticated (has valid access token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds

    return Date.now() < expiresAt;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Decode JWT token to get user information
 */
export const decodeToken = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user ID from JWT token
 */
export const getUserIdFromToken = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.sub || null;
};

/**
 * Create headers with JWT token for API requests
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Make an authenticated API request
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (): Date | null => {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;

  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
  const expiration = getTokenExpiration();
  if (!expiration) return true;

  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return expiration.getTime() < fiveMinutesFromNow;
};
