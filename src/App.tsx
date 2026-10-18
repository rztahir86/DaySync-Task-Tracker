import React, { useState, useEffect, useMemo } from 'react';
import { Task, SeniorProfile, BriefingStyle, BriefingHistoryItem } from './types';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadSeniorProfile,
  saveSeniorProfile,
  loadBriefingHistory,
  addBriefingToHistory,
  clearBriefingHistory,
  resetToSampleData,
  exportAllData,
  importAllData,
} from './utils/storage';
import { buildWhatsAppUrls } from './utils/whatsappFormatter';
import { Header, ActiveTab } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TaskCard } from './components/TaskCard';
import { TaskFormModal } from './components/TaskFormModal';
import { WhatsAppComposer } from './components/WhatsAppComposer';
import { SeniorProfileModal } from './components/SeniorProfileModal';
import { HistoryView } from './components/HistoryView';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { AnalyticsView } from './components/AnalyticsView';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  RotateCcw,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<SeniorProfile>(loadSeniorProfile);
  const [history, setHistory] = useState<BriefingHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSeniorModalOpen, setIsSeniorModalOpen] = useState(false);

  // Quick inline add input
  const [quickTitle, setQuickTitle] = useState('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load
  useEffect(() => {
    const loadedTasks = loadTasksFromStorage();
    setTasks(loadedTasks);
    setProfile(loadSeniorProfile());
    setHistory(loadBriefingHistory());
  }, []);

  // Save tasks on changes
  const handleUpdateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasksToStorage(newTasks);
  };

  const handleSaveProfile = (newProfile: SeniorProfile) => {
    setProfile(newProfile);
    saveSeniorProfile(newProfile);
    showToast('Senior details and preferences updated');
  };

  // Quick inline add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: quickTitle.trim(),
      status: 'in_progress',
      priority: 'medium',
      category: 'General',
      progressPercent: 20,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      selectedForUpdate: true,
    };

    const updated = [newTask, ...tasks];
    handleUpdateTasks(updated);
    setQuickTitle('');
    showToast('Task added & queued for today’s WhatsApp update');
  };

  // Detailed save from Modal
  const handleSaveTaskFromModal = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    taskId?: string
  ) => {
    const now = new Date().toISOString();
    if (taskId) {
      // Edit existing
      const updated = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...taskData,
              updatedAt: now,
            }
          : t
      );
      handleUpdateTasks(updated);
      showToast('Task updated successfully');
    } else {
      // New task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newTask, ...tasks];
      handleUpdateTasks(updated);
      showToast('New task created');
    }
    setEditingTask(null);
  };

  // Toggle complete / active
  const handleToggleStatus = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const isNowDone = t.status !== 'completed';
        return {
          ...t,
          status: (isNowDone ? 'completed' : 'in_progress') as Task['status'],
          progressPercent: isNowDone ? 100 : t.progressPercent === 100 ? 50 : t.progressPercent,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
          // Automatically keep in WhatsApp update when toggled
          selectedForUpdate: true,
        };
      }
      return t;
    });
    handleUpdateTasks(updated);
  };

  // Toggle WhatsApp selection
  const handleToggleUpdateSelection = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, selectedForUpdate: !t.selectedForUpdate } : t
    );
    handleUpdateTasks(updated);
  };

  // Update progress
  const handleUpdateProgress = (taskId: string, percent: number) => {
    const updated: Task[] = tasks.map((t) => {
      if (t.id === taskId) {
        const isDone = percent === 100;
        const newStatus: Task['status'] = isDone
          ? 'completed'
          : t.status === 'completed'
          ? 'in_progress'
          : t.status;
        return {
          ...t,
          progressPercent: percent,
          status: newStatus,
          completedAt: isDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleUpdateTasks(updated);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    handleUpdateTasks(updated);
    showToast('Task removed');
  };

  // Save briefing to history
  const handleSaveBriefingToHistory = (messageText: string, style: BriefingStyle) => {
    const selected = tasks.filter((t) => t.selectedForUpdate);
    const item: BriefingHistoryItem = {
      id: `briefing-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      recipientName: profile.name,
      recipientPhone: profile.phone,
      style,
      messageText,
      completedTasksCount: selected.filter((t) => t.status === 'completed').length,
      inProgressTasksCount: selected.filter((t) => t.status === 'in_progress').length,
      blockedTasksCount: selected.filter((t) => t.status === 'blocked').length,
      upcomingTasksCount: selected.filter((t) => t.status === 'todo').length,
    };
    addBriefingToHistory(item);
    setHistory(loadBriefingHistory());
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your sent update logs?')) {
      clearBriefingHistory();
      setHistory([]);
      showToast('Sent logs cleared');
    }
  };

  const handleOpenInWhatsApp = (phone: string, text: string) => {
    const { universalUrl } = buildWhatsAppUrls(phone, text);
    window.open(universalUrl, '_blank', 'noopener,noreferrer');
  };

  // Data Export / Import / Reset
  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daysync-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup file exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAllData(content)) {
        setTasks(loadTasksFromStorage());
        setProfile(loadSeniorProfile());
        setHistory(loadBriefingHistory());
        showToast('Data imported successfully');
      } else {
        alert('Invalid backup JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSample = () => {
    if (window.confirm('Reset all tasks and senior settings to sample data?')) {
      const res = resetToSampleData();
      setTasks(res.tasks);
      setProfile(res.profile);
      showToast('Reset to demo sample tasks');
    }
  };

  // Filtered task collection
  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category));
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesCategory = task.category.toLowerCase().includes(q);
        const matchesBlocker = task.blockerReason?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesBlocker) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'high_urgent') {
          if (task.priority !== 'high' && task.priority !== 'urgent') return false;
        } else if (task.priority !== priorityFilter) {
          return false;
        }
      }

      // Category
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Grouped task segments
  const blockedTasks = filteredTasks.filter((t) => t.status === 'blocked');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const selectedForUpdateCount = tasks.filter((t) => t.selectedForUpdate).length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTaskCount={selectedForUpdateCount}
        totalActiveCount={tasks.filter((t) => t.status !== 'completed').length}
        onOpenQuickAdd={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        seniorName={profile.name}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Daily Standup Reminder Banner if past reminder time */}
        <DailyReminderBanner
          profile={profile}
          pendingTasksCount={selectedForUpdateCount}
          onOpenCompose={() => setActiveTab('compose')}
        />

        {/* Tab 1: Tasks & Agenda */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Quick Stats Strip */}
            <StatsBar
              tasks={tasks}
              onFilterByStatus={(st) => setStatusFilter(st)}
              activeStatusFilter={statusFilter}
            />

            {/* Quick Add Bar & Global Actions */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Remember a task (e.g. Test push notifications on iOS)... Press Enter to add"
                  className="flex-1 px-3.5 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap"
                  title="Open full task creator with time spent, blockers, and milestone settings"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Full Details</span>
                </button>
              </form>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white border border-neutral-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, categories, or blockers..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-neutral-50/50"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md text-xs font-medium">
                  {['all', 'in_progress', 'blocked', 'completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded transition-colors capitalize ${
                        statusFilter === st
                          ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st === 'in_progress' ? 'Active' : st}
                    </button>
                  ))}
                </div>

                {/* Priority Selector */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  aria-label="Filter by priority"
                  className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white text-neutral-700 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="high_urgent">High &amp; Urgent</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Category Selector */}
                {categories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                    className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white text-neutral-700 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900 underline px-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Task Lists Grouped Logically */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-2.5">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">No matching tasks found</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Try adjusting your search query or filters, or add a new task above.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Blockers Section (High Attention) */}
                {blockedTasks.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-900">
                          Blockers &amp; Impediments ({blockedTasks.length})
                        </h2>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Items requiring senior input or external clearance
                      </span>
                    </div>

                    <div className="space-y-2">
                      {blockedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onToggleUpdateSelection={handleToggleUpdateSelection}
                          onUpdateProgress={handleUpdateProgress}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. In Progress / Active Work */}
                {inProgressTasks.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                          Work In Progress ({inProgressTasks.length})
                        </h2>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        Active today
                      </span>
                    </div>

                    <div className="space-y-2">
                      {inProgressTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onToggleUpdateSelection={handleToggleUpdateSelection}
                          onUpdateProgress={handleUpdateProgress}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Backlog / To Do */}
                {todoTasks.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neutral-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Upcoming &amp; Planned ({todoTasks.length})
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {todoTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onToggleUpdateSelection={handleToggleUpdateSelection}
                          onUpdateProgress={handleUpdateProgress}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Completed Section */}
                {completedTasks.length > 0 && (
                  <section className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Completed Today ({completedTasks.length})
                        </h2>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Ready for WhatsApp progress report
                      </span>
                    </div>

                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onToggleUpdateSelection={handleToggleUpdateSelection}
                          onUpdateProgress={handleUpdateProgress}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Quick Sticky Bar to Jump to WhatsApp Generator */}
            <div className="bg-neutral-900 text-white p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">
                    {selectedForUpdateCount} tasks queued for WhatsApp standup
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Recipient: <strong className="text-neutral-200">{profile.name}</strong> ({profile.phone ? `+${profile.phone}` : 'No phone set'})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap"
              >
                <span>Compose &amp; Send WhatsApp Update</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Utilities: Backup, Export, Sample Data */}
            <div className="pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span>Backup &amp; Sync:</span>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export JSON</span>
                </button>

                <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleResetSample}
                className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors"
                title="Restore default sample tasks and senior settings"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: WhatsApp Composer */}
        {activeTab === 'compose' && (
          <WhatsAppComposer
            tasks={tasks}
            profile={profile}
            onUpdateTasks={handleUpdateTasks}
            onSaveBriefingToHistory={handleSaveBriefingToHistory}
            onOpenSeniorSettings={() => setIsSeniorModalOpen(true)}
          />
        )}

        {/* Tab: Analytics (7-Day Completion vs Pending Trend Line Chart) */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            onNavigateToCompose={() => setActiveTab('compose')}
          />
        )}

        {/* Tab 3: Senior Profile & Preferences */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Senior Profile &amp; WhatsApp Settings
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Configure your recipient manager, phone number, greeting format, and reminder schedule.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Senior details saved');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Senior / Lead Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={profile.titleOrRole}
                    onChange={(e) => setProfile({ ...profile, titleOrRole: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Senior&apos;s WhatsApp Number (Country Code + Digits)
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="e.g. 14155552671 or 919876543210"
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Example: <span className="font-mono">1</span> for US (+1415...), <span className="font-mono">91</span> for India (+9198...), <span className="font-mono">44</span> for UK (+447...).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Your Name (Sign-off)
                  </label>
                  <input
                    type="text"
                    value={profile.senderName}
                    onChange={(e) => setProfile({ ...profile, senderName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Salutation Template
                  </label>
                  <input
                    type="text"
                    value={profile.salutation}
                    onChange={(e) => setProfile({ ...profile, salutation: e.target.value })}
                    placeholder="e.g. Hi Alex or Hello Sir"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Sign-off Template
                </label>
                <textarea
                  rows={2}
                  value={profile.signoff}
                  onChange={(e) => setProfile({ ...profile, signoff: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Reminder Settings */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">
                      Daily Standup Reminder
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Alerts you each afternoon to compile and send your progress report
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.reminderEnabled}
                    onChange={(e) => setProfile({ ...profile, reminderEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {profile.reminderEnabled && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-neutral-700">
                      Reminder Time:
                    </label>
                    <input
                      type="time"
                      value={profile.reminderTime}
                      onChange={(e) => setProfile({ ...profile, reminderTime: e.target.value })}
                      className="px-3 py-1.5 text-xs font-mono border border-neutral-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveProfile(profile)}
                  className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Save Senior Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: History & Sent Logs */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onOpenInWhatsApp={handleOpenInWhatsApp}
          />
        )}
      </main>

      {/* Task Form Modal (Create / Edit) */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTaskFromModal}
        editingTask={editingTask}
      />

      {/* Senior Settings Modal */}
      <SeniorProfileModal
        isOpen={isSeniorModalOpen}
        onClose={() => setIsSeniorModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
