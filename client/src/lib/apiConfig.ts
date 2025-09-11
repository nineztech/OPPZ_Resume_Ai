// API Configuration with fallback
const getApiUrl = (): string => {
  // Check if VITE_API_URL is defined and not empty
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim() !== '') {
    return envApiUrl;
  }
  
  // If in development mode, use local API
  if (import.meta.env.DEV) {
    return 'http://localhost:5006/api';
  }
  
  // Fallback to production URL
  return 'https://oppzresumeai-production.up.railway.app/api';
};

export const API_URL = getApiUrl();

// Debug function to log the API URL being used
export const logApiUrl = () => {
  console.log('API URL being used:', API_URL);
  console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
  console.log('All env vars:', import.meta.env);
  console.log('Env API URL type:', typeof import.meta.env.VITE_API_URL);
  console.log('Env API URL length:', import.meta.env.VITE_API_URL?.length);
};
