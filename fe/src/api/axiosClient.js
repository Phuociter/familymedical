import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Thêm token vào header cho mỗi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export default axiosClient;
