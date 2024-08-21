import axios from 'axios';

export const API_development_environment = 'http://localhost:8000';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_development_environment,
});

// 配置拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;  // 确保 axiosInstance 被默认导出