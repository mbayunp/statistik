import axios from 'axios';
import Swal from 'sweetalert2';

let isSessionExpiredAlertOpen = false;

/**
 * Checks if a JWT token is missing, invalid, or expired.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    
    // Decode base64 URL safe
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    if (payload && payload.exp) {
      // payload.exp is in seconds, Date.now() is in milliseconds
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return true; // If parsing fails, consider token invalid/expired
  }
};

/**
 * Displays a SweetAlert notification informing the user that their session has expired
 * and provides a direct button to return to the Admin Login page.
 */
export const handleSessionExpired = (customMessage?: string) => {
  if (isSessionExpiredAlertOpen) return;
  isSessionExpiredAlertOpen = true;

  // Clear stale token
  localStorage.removeItem('token');

  Swal.fire({
    title: 'Sesi Login Berakhir (403/401)',
    text: customMessage || 'Sesi login Anda telah habis atau token autentikasi tidak valid. Silakan login kembali untuk mengakses Menu Admin.',
    icon: 'warning',
    confirmButtonText: 'Ke Menu Login Admin',
    confirmButtonColor: '#00D2B4', // Brand primary color
    customClass: {
      confirmButton: 'font-bold px-6 py-3 rounded-xl shadow-lg',
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    isSessionExpiredAlertOpen = false;
    window.location.href = '/login';
  });
};

/**
 * Configures global Axios request and response interceptors:
 * 1. Automatically attaches Authorization: Bearer <token> if available.
 * 2. Catches 401 and 403 HTTP status codes to trigger the session expired notice.
 */
export const setupAxiosInterceptors = () => {
  // Request Interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const requestUrl = error.config?.url || '';

        // Exclude login & PIN authentication endpoints where 401/403 mean wrong password/PIN
        const isAuthEndpoint = 
          requestUrl.includes('/api/auth/login') ||
          requestUrl.includes('/api/auth/verify-pin') ||
          requestUrl.includes('/api/auth/reset-password');

        if ((status === 401 || status === 403) && !isAuthEndpoint) {
          const serverMessage = error.response.data?.message;
          handleSessionExpired(serverMessage);
        }
      }
      return Promise.reject(error);
    }
  );
};
