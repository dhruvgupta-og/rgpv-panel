// API Base URL - defaults to localhost for development, can be overridden by VITE_API_URL env var
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.80.2.47:5000';

console.log('📡 API Base URL:', API_BASE_URL); // Debug log

export default API_BASE_URL;
