import axios from 'axios';

// 配置生产环境的 API 地址
export const kastacloud_environment = 'http://kastacloud.com';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: kastacloud_environment,  // 基础 URL 设为生产环境
});

// 配置拦截器，自动添加 Authorization 头
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');  // 从 localStorage 中获取 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // 如果 token 存在，添加 Authorization 头
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器，处理 401 错误（未授权）
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');  // 移除过期的 token
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';  // 重定向到登录页面
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;  // 默认导出 axios 实例