import axios from 'axios';
import { UserProfile } from '../types';

const API_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  banner?: string;
  major?: string;
  location?: string;
  streak?: number;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/auth/profile`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};