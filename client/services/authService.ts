import axios from 'axios';
import { UserProfile, Task, StudySlot } from '../types';

// const API_URL = 'http://localhost:5000/api';

// Use the environment variable if available, otherwise fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;



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
  totalStudyMinutes?: number;
  lastStudyDate?: string;
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
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      // Call logout endpoint to clear lastActive
      axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Logout error:', err));
    }
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
  },

  async getFolders(): Promise<{ folders: any[] }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/folders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createFolder(folderData: { name: string }): Promise<{ folder: any }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/folders`, folderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteFolder(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/folders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async addFile(folderId: string, fileData: { name: string }): Promise<{ folder: any }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/folders/${folderId}/files`, fileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async uploadFile(folderId: string, file: File): Promise<{ folder: any }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/folders/${folderId}/files`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getFilePreview(folderId: string, fileId: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/folders/${folderId}/files/${fileId}/preview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async downloadFile(folderId: string, fileId: string, fileName: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/folders/${folderId}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    
    // Create blob and trigger download with actual filename
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentElement?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async deleteFile(folderId: string, fileId: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/folders/${folderId}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async startStudySession(): Promise<{ sessionId: string; startTime: Date }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/study-sessions/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async endStudySession(startTime: Date): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/study-sessions/end`, { startTime }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getStatistics(days: number = 7): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/statistics?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getStudyHours(): Promise<{ totalHours: string; totalMinutes: number }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/study-hours`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ===== ADMIN METHODS =====
  async getAdminUsers(): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getAdminStatistics(): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async registerStudent(name: string, email: string, password: string, major: string): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/admin/register-student`, 
      { name, email, password, major },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.user;
  },

  async deleteUser(userId: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getActiveUsers(): Promise<{ activeNow: number }> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/active-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/request-reset`, { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { 
      token, 
      newPassword, 
      confirmPassword 
    });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/auth/change-password`, 
      { currentPassword, newPassword, confirmPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};
