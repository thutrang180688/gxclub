
export type Role = 'USER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface PermissionRecord {
  email: string;
  role: Role;
  addedAt: string;
}

export type ClassStatus = 'NORMAL' | 'CANCELLED' | 'SUBSTITUTE';

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'ALERT';
  sender: string;
}

export interface Rating {
  id: string;
  classId: string;
  userEmail: string;
  userName: string;
  stars: number;
  comment: string;
  timestamp: string;
}

export interface ClassSession {
  id: string;
  dayIndex: number;
  time: string;
  className: string;
  instructor: string;
  category: 'YOGA' | 'TAICHI' | 'DANCE' | 'OTHER';
  status: ClassStatus;
  subInstructor?: string;
}

export interface HeaderConfig {
  logo: string;
  address: string;
  hotline: string;
  website: string;
  scheduleTitle: string;
  holidayNotice: string; // Thêm thông báo nghỉ lễ
}

export const DAYS_OF_WEEK = [
  { vn: 'Thứ 2', eng: 'Monday' },
  { vn: 'Thứ 3', eng: 'Tuesday' },
  { vn: 'Thứ 4', eng: 'Wednesday' },
  { vn: 'Thứ 5', eng: 'Thursday' },
  { vn: 'Thứ 6', eng: 'Friday' },
  { vn: 'Thứ 7', eng: 'Saturday' },
  { vn: 'Chủ Nhật', eng: 'Sunday' },
];

export const CATEGORY_COLORS = {
  YOGA: 'bg-sky-500',
  TAICHI: 'bg-emerald-600',
  DANCE: 'bg-orange-500',
  OTHER: 'bg-indigo-500'
};
