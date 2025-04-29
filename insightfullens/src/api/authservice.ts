import axios from 'axios';

// Fix for the process.env issue in TypeScript
declare global {
  interface Window {
    env?: {
      REACT_APP_API_URL?: string;
    }
  }
}

// Use environment variables in a TypeScript-friendly way
const API_URL = 
  typeof window !== 'undefined' && window.env?.REACT_APP_API_URL || 
  import.meta.env?.VITE_API_URL || 
  'http://localhost:8000/api';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

// Updated to match your actual backend response
export interface AuthResponse {
  refresh: string;
  access: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface TokenDebugInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenStart?: string;
  refreshTokenStart?: string;
}

// Create axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor - updated to use access token
authAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and other auth errors
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we're not trying to refresh token already and not on login page
    if (error.response && 
        error.response.status === 401 && 
        !originalRequest._retry &&
        originalRequest.url !== '/auth/token/refresh/' &&
        window.location.pathname !== '/login') {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          // Store new tokens
          if (response.data && response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            
            // Update auth header and retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, logout and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // If refresh token request itself fails with 401
    if (error.response && 
        error.response.status === 401 && 
        (originalRequest.url === '/auth/token/refresh/' || originalRequest._retry)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Login service - updated to handle JWT pair
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', credentials.username);
    const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    console.log('Login response:', response.data);
    
    // Store both tokens
    if (response.data && response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      return response.data;
    } else {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format - missing access token');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || error.response.data.detail || 'Login failed');
    }
    throw new Error('Network error occurred');
  }
};

// Register service
export const registerUser = async (userData: RegisterCredentials): Promise<AuthResponse> => {
  try {
    // Direct URL for register endpoint
    const response = await axios.post(`${API_URL}/auth/register/`, userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.data.detail || 'Registration failed');
    }
    throw new Error('Network error occurred');
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await authAxios.get('/auth/profile/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

// Logout service
export const logoutUser = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Optionally notify your backend about the logout
  // await authAxios.post('/auth/logout');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken; // Returns true if token exists, false otherwise
};

// Add debugging helper with explicit type return
export const debugTokenInfo = (): TokenDebugInfo => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenStart: accessToken ? `${accessToken.substring(0, 10)}...` : undefined,
    refreshTokenStart: refreshToken ? `${refreshToken.substring(0, 10)}...` : undefined,
  };
};