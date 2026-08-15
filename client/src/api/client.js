import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quickfit_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getErrorMessage(error) {
  const data = error.response?.data;
  const firstValidationError = data?.errors?.[0];

  if (typeof firstValidationError === 'string') {
    return firstValidationError;
  }

  if (firstValidationError?.message) {
    return firstValidationError.message;
  }

  if (data?.message) {
    return data.message;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.';
  }

  if (!error.response) {
    return 'Unable to reach QuickFit. Check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}
