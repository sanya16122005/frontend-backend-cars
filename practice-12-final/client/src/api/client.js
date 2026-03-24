import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!accessToken || !refreshToken) {
        localStorage.clear();
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.clear();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
