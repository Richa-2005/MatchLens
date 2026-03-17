import axios from 'axios';

//Base URL of app-api

const api = axios.create({
    baseURL : import.meta.env.VITE_APP_API_URL
});

//Integrates token from the local storage to request config header before api call. 
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if(token){
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    
)

export default api;