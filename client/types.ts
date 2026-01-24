
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface StudySlot {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  day: string;
  color: string;
}

export interface FileAsset {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

export interface Folder {
  id: string;
  name: string;
  files: FileAsset[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  banner: string;
  major: string;
  location: string;
  streak: number;
  bio: string;
  joinDate: string;
  createdAt?: string;
  totalStudyMinutes?: number;
  lastStudyDate?: string;
}

export interface Student extends UserProfile {
  id: string;
  passwordHash: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
