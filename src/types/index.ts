export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  progressPercent: number; // 0 - 100
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  blockerReason?: string;
  nextStep?: string;
  estimatedMinutes?: number;
  timeSpentMinutes?: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  selectedForUpdate: boolean;
}

export type BriefingStyle = 'executive' | 'standup' | 'detailed' | 'bullet';

export interface SeniorProfile {
  name: string;
  titleOrRole: string;
  phone: string; // international format without spaces/dashes, e.g. 14155552671
  salutation: string;
  signoff: string;
  senderName: string;
  preferredStyle: BriefingStyle;
  includeBlockers: boolean;
  includeNextSteps: boolean;
  includeProgressPercent: boolean;
  includeTimeSpent: boolean;
  reminderTime: string; // e.g. "17:30"
  reminderEnabled: boolean;
}

export interface BriefingHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  recipientName: string;
  recipientPhone: string;
  style: BriefingStyle;
  messageText: string;
  completedTasksCount: number;
  inProgressTasksCount: number;
  blockedTasksCount: number;
  upcomingTasksCount: number;
}
