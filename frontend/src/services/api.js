import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/sessions
});

// Đính kèm access token cho mọi request nếu có
api.interceptors.request.use((config) => {
  // Ưu tiên accessToken mới, fallback sang token cũ nếu còn
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);

export const authAPI = {
  signUp: async (userData) => {
    const { data } = await api.post('/auth/Sign_up', {
      email: userData.email,
      password: userData.password,
      name: userData.fullName
    });
    return data;
  },

  signIn: async (credentials) => {
    const { data } = await api.post('/auth/Sign_in', {
      email: credentials.email,
      password: credentials.password
    });
    return data;
  }
};

export const userAPI = {
  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data.user;
  }
};

export const medicalAPI = {
  createRecord: async (payload) => {
    const { data } = await api.post('/medical', payload);
    return data;
  }
};

export default api;
