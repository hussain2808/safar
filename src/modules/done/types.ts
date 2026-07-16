export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Schedule =
  | { frequency: 'daily' }
  | { frequency: 'weekly'; weekdays: number[] } // 0=Sun..6=Sat
  | { frequency: 'monthly'; dayOfMonth: number } // 1-31
  | { frequency: 'yearly'; month: number; day: number }; // month 1-12

export interface HabitRecord {
  id: string;
  name: string;
  icon: string;
  color?: string;
  schedule: Schedule;
  startDate: number;
  reminderTime?: string;
  notes?: string;
  archived?: boolean;
  sortOrder?: number;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completedAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'habit' | 'completion';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
