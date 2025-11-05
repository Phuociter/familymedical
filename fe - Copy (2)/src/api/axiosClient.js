import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export default axiosClient;
