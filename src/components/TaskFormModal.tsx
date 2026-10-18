import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, taskId?: string) => void;
  editingTask: Task | null;
}

const CATEGORY_PRESETS = [
  'Engineering',
  'Frontend',
  'Backend',
  'Infrastructure',
  'Bugfix',
  'Review',
  'Client Deliverable',
  'Planning',
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Engineering');
  const [customCategory, setCustomCategory] = useState('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [blockerReason, setBlockerReason] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number>(0);
  const [selectedForUpdate, setSelectedForUpdate] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      if (CATEGORY_PRESETS.includes(editingTask.category)) {
        setCategory(editingTask.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(editingTask.category);
      }
      setProgressPercent(editingTask.progressPercent ?? 0);
      setDueDate(editingTask.dueDate || '');
      setBlockerReason(editingTask.blockerReason || '');
      setNextStep(editingTask.nextStep || '');
      setTimeSpentMinutes(editingTask.timeSpentMinutes || 0);
      setSelectedForUpdate(editingTask.selectedForUpdate ?? true);
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory('Engineering');
      setCustomCategory('');
      setProgressPercent(0);
      setDueDate(new Date().toISOString().split('T')[0]);
      setBlockerReason('');
      setNextStep('');
      setTimeSpentMinutes(0);
      setSelectedForUpdate(true);
    }
    setError('');
  }, [editingTask, isOpen]);

  // If status changes to completed, set progress to 100%
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'completed' && progressPercent < 100) {
      setProgressPercent(100);
    } else if (newStatus === 'todo' && progressPercent === 100) {
      setProgressPercent(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        category: finalCategory,
        progressPercent,
        dueDate: dueDate || undefined,
        blockerReason: blockerReason.trim() || undefined,
        nextStep: nextStep.trim() || undefined,
        timeSpentMinutes: timeSpentMinutes > 0 ? timeSpentMinutes : undefined,
        completedAt: status === 'completed' ? (editingTask?.completedAt || new Date().toISOString()) : undefined,
        selectedForUpdate,
      },
      editingTask ? editingTask.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-neutral-500">
              Track your day&apos;s progress and update your senior via WhatsApp
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Integrate Redis caching on user sessions"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Details / Scope / Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What specifically was accomplished or investigated?"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="todo">To Do (Planned)</option>
                <option value="in_progress">In Progress (Active)</option>
                <option value="blocked">Blocked (Needs Help)</option>
                <option value="completed">Completed (Done)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent / Critical</option>
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Progress Percentage
              </label>
              <span className="font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
              <span>0% (Not started)</span>
              <span>50% (Halfway)</span>
              <span>100% (Complete)</span>
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="mt-2 w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
              </input>
            </div>
          </div>

          {/* Time spent (minutes) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Time Spent Today (Minutes, optional)
            </label>
            <input
              type="number"
              min="0"
              step="15"
              value={timeSpentMinutes || ''}
              onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
              placeholder="e.g. 45 or 90"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Blocker details (highlighted if blocked or user wants to specify) */}
          <div className={status === 'blocked' ? 'p-3 bg-red-50 border border-red-200 rounded-md' : ''}>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Blocker / Impediment (Reported to Senior)
            </label>
            <input
              type="text"
              value={blockerReason}
              onChange={(e) => setBlockerReason(e.target.value)}
              placeholder="e.g. Waiting on API gateway keys from security team"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Next milestone */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Next Step / Target for Tomorrow
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Complete load test simulation and submit PR for review"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Include in WhatsApp briefing checkbox */}
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="selectedForUpdate"
              checked={selectedForUpdate}
              onChange={(e) => setSelectedForUpdate(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="selectedForUpdate" className="text-xs font-medium text-neutral-800 cursor-pointer">
              Include in today&apos;s WhatsApp briefing to senior
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
          >
            {editingTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
