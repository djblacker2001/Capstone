import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = (await AsyncStorage.getItem('accessToken')) || (await AsyncStorage.getItem('token'));
      const currentLang = (await AsyncStorage.getItem('lang')) || 'vi';

      if (config.headers) {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['accept-language'] = currentLang;
      }
    } catch (error) {
      console.error('Lỗi khi đọc AsyncStorage trong axiosClient:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'token']);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;