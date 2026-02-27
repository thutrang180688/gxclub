
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
  category: 'YOGA' | 'TAICHI' | 'DANCE' | 'OTHER' | 'ORANGE' | 'BLUE' | 'GREEN' | 'RED' | 'YELLOW' | 'PURPLE' | 'TEAL' | 'INDIGO';
  status: ClassStatus;
  subInstructor?: string;
  specificDate?: string; // YYYY-MM-DD
}

export interface HeaderConfig {
  logo: string;
  address: string;
  hotline: string;
  website: string;
  scheduleTitle: string;
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
  OTHER: 'bg-indigo-500',
  ORANGE: 'bg-orange-600',
  BLUE: 'bg-blue-600',
  GREEN: 'bg-green-600',
  RED: 'bg-red-600',
  YELLOW: 'bg-yellow-500',
  PURPLE: 'bg-purple-600',
  TEAL: 'bg-teal-600',
  INDIGO: 'bg-indigo-700'
};

export const CATEGORY_LABELS = {
  YOGA: 'Yoga',
  TAICHI: 'Tai Chi',
  DANCE: 'Dance',
  OTHER: 'Khác',
  ORANGE: 'Vàng Cam',
  BLUE: 'Xanh Dương',
  GREEN: 'Xanh Lá',
  RED: 'Đỏ',
  YELLOW: 'Vàng',
  PURPLE: 'Tím',
  TEAL: 'Lục',
  INDIGO: 'Lam'
};
