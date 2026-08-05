import axios from 'axios';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alpha_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If we get a 401, it means the token is expired or invalid.
      // We can clear the token and force a logout here.
      localStorage.removeItem('alpha_token');
      // A more robust app might dispatch an event to the AuthContext here
      // or redirect to login. For now, the user will just bounce on next page load.
    }
    return Promise.reject(error);
  }
);
