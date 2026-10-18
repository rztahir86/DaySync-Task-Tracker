import { Task, SeniorProfile, BriefingHistoryItem } from '../types';

const STORAGE_KEYS = {
  TASKS: 'daysync_tasks_v1',
  SENIOR: 'daysync_senior_profile_v1',
  HISTORY: 'daysync_briefing_history_v1',
  LAST_REMINDER_DATE: 'daysync_last_reminder_date_v1',
};

const DEFAULT_SENIOR_PROFILE: SeniorProfile = {
  name: 'Alex Rivera',
  titleOrRole: 'Engineering Manager',
  phone: '14155550198',
  salutation: 'Hi Alex',
  signoff: 'Best regards,\nZeeshan',
  senderName: 'Zeeshan',
  preferredStyle: 'executive',
  includeBlockers: true,
  includeNextSteps: true,
  includeProgressPercent: true,
  includeTimeSpent: true,
  reminderTime: '17:30',
  reminderEnabled: true,
};

const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Implement OAuth Token Refresh in Auth Microservice',
    description: 'Updated expired JWT handling and verified retry logic on 401s.',
    status: 'completed',
    priority: 'high',
    category: 'Backend',
    progressPercent: 100,
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentMinutes: 90,
    nextStep: 'Deploy to staging cluster',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    selectedForUpdate: true,
  },
  {
    id: 'task-2',
    title: 'Refactor Task Progress Dashboard UI Components',
    description: 'Modernized layout with accessible keyboard controls and zero-pill status counters.',
    status: 'in_progress',
    priority: 'high',
    category: 'Frontend',
    progressPercent: 75,
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentMinutes: 120,
    nextStep: 'Finalize mobile drawer responsiveness and test on small screens',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    selectedForUpdate: true,
  },
  {
    id: 'task-3',
    title: 'Resolve Payment Webhook Timeout under Heavy Load',
    description: 'Investigating Redis lock contention causing delayed webhook acknowledgments.',
    status: 'blocked',
    priority: 'urgent',
    category: 'Infrastructure',
    progressPercent: 40,
    dueDate: new Date().toISOString().split('T')[0],
    blockerReason: 'Waiting for DevOps permission to examine staging Redis cluster slowlog.',
    timeSpentMinutes: 60,
    nextStep: 'Run load simulation script once DB credentials are provisioned',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    selectedForUpdate: true,
  },
  {
    id: 'task-4',
    title: 'Prepare Sprint 24 Velocity Review Slide Deck',
    description: 'Collate team PR velocity and milestone completion rate.',
    status: 'todo',
    priority: 'medium',
    category: 'Planning',
    progressPercent: 15,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nextStep: 'Extract sprint metrics from issue tracker',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    selectedForUpdate: true,
  },
  {
    id: 'task-5',
    title: 'Conduct Code Review for PR #84 (Notification Worker)',
    description: 'Checked edge cases on dead-letter queue retries and message parsing.',
    status: 'completed',
    priority: 'medium',
    category: 'Review',
    progressPercent: 100,
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentMinutes: 45,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    selectedForUpdate: true,
  },
];

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasksToStorage(INITIAL_SAMPLE_TASKS);
      return INITIAL_SAMPLE_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_TASKS;
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return INITIAL_SAMPLE_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export function loadSeniorProfile(): SeniorProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENIOR);
    if (!raw) {
      saveSeniorProfile(DEFAULT_SENIOR_PROFILE);
      return DEFAULT_SENIOR_PROFILE;
    }
    return { ...DEFAULT_SENIOR_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load senior profile:', err);
    return DEFAULT_SENIOR_PROFILE;
  }
}

export function saveSeniorProfile(profile: SeniorProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SENIOR, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save senior profile:', err);
  }
}

export function loadBriefingHistory(): BriefingHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load briefing history:', err);
    return [];
  }
}

export function addBriefingToHistory(item: BriefingHistoryItem): void {
  try {
    const current = loadBriefingHistory();
    const updated = [item, ...current].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save briefing to history:', err);
  }
}

export function clearBriefingHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function exportAllData(): string {
  const data = {
    tasks: loadTasksFromStorage(),
    profile: loadSeniorProfile(),
    history: loadBriefingHistory(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      saveTasksToStorage(parsed.tasks);
    }
    if (parsed.profile && typeof parsed.profile === 'object') {
      saveSeniorProfile(parsed.profile);
    }
    if (parsed.history && Array.isArray(parsed.history)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
    }
    return true;
  } catch (err) {
    console.error('Failed to import data:', err);
    return false;
  }
}

export function resetToSampleData(): { tasks: Task[]; profile: SeniorProfile } {
  saveTasksToStorage(INITIAL_SAMPLE_TASKS);
  saveSeniorProfile(DEFAULT_SENIOR_PROFILE);
  return {
    tasks: INITIAL_SAMPLE_TASKS,
    profile: DEFAULT_SENIOR_PROFILE,
  };
}
