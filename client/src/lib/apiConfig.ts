// API Configuration with fallback
const getApiUrl = (): string => {
  // Check if VITE_API_URL is defined
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to production URL
  return 'https://oppzresumeai-production.up.railway.app/api';
};

export const API_URL = getApiUrl();

// Debug function to log the API URL being used
export const logApiUrl = () => {
  console.log('API URL being used:', API_URL);
  console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
};
