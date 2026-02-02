// API配置
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

console.log('API Base URL:', API_BASE_URL);