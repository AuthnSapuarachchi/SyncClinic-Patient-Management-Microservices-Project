import axios from 'axios';

// 1. Point this directly to your API Gateway!
const api = axios.create({
    baseURL: 'http://localhost:8080', 
});

// 2. The Interceptor: Before ANY request leaves the browser, do this:
api.interceptors.request.use(
    (config) => {
        // Look inside the browser's local storage for the JWT
        const token = localStorage.getItem('jwt_token');
        
        // If it exists, silently attach it to the header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;