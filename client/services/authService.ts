import axios from 'axios';
import { UserProfile, Task, StudySlot } from '../types';

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
  joinDate?: string;
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
  },

  async getTasks(): Promise<{ tasks: Task[] }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createTask(taskData: { title: string; priority: Task['priority']; category: string }): Promise<{ task: Task }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/tasks/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async getSlots(): Promise<{ slots: StudySlot[] }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/slots`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createSlot(slotData: Omit<StudySlot, 'id'>): Promise<{ slot: StudySlot }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/slots`, slotData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteSlot(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/slots/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
