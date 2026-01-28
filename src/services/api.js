import axios from 'axios';

// Use your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 8000
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful API calls
        console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => 
        api.post('/auth/login', { email, password }),
    
    getOfficers: () => 
        api.get('/auth/officers'),
};

// Vehicle API
export const vehicleAPI = {
    getAll: () => 
        api.get('/vehicles'),
    
    search: (regNumber) => 
        api.get(`/vehicles/search/${regNumber}`),
    
    create: (data) => 
        api.post('/vehicles', data),
};

// Repair API
export const repairAPI = {
    getAll: () => 
        api.get('/repairs'),
    
    getByStatus: (status) => 
        api.get(`/repairs/status/${status}`),
    
    getEngineerRepairs: (engineerId) => 
        api.get(`/repairs/engineer/${engineerId}`),
    
    create: (data) => 
        api.post('/repairs', data),
    
    updateStatus: (id, data) => 
        api.put(`/repairs/${id}/status`, data),
    
    getStats: () => 
        api.get('/repairs/stats/summary'),
};

// Test connection
export const testConnection = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log('✅ Backend connection:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Cannot connect to backend:', error.message);
        return false;
    }
};

export default api;