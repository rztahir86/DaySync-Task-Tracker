import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';
import { Check, AlertTriangle, SendHorizontal, Edit2, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onToggleUpdateSelection: (taskId: string) => void;
  onUpdateProgress: (taskId: string, percent: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onToggleUpdateSelection,
  onUpdateProgress,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDone = task.status === 'completed';
  const isBlocked = task.status === 'blocked';

  const priorityStyles: Record<TaskPriority, { text: string; label: string }> = {
    low: { text: 'text-neutral-500', label: 'Low' },
    medium: { text: 'text-neutral-700', label: 'Medium' },
    high: { text: 'text-amber-700 font-medium', label: 'High' },
    urgent: { text: 'text-red-700 font-semibold', label: 'Urgent' },
  };

  return (
    <div
      className={`border rounded-lg transition-all ${
        isDone
          ? 'bg-neutral-50/80 border-neutral-200 opacity-80'
          : isBlocked
          ? 'bg-red-50/30 border-red-200'
          : 'bg-white border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
            isDone
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-neutral-300 bg-white hover:border-neutral-400'
          }`}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        {/* Core Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-medium leading-snug break-words ${
                isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                title="Edit task"
                aria-label="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description if present */}
          {task.description && (
            <p className="mt-1 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Clean Unboxed Metadata: Category, Priority, Progress, Due */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-500 font-sans">
            <span className="font-medium text-neutral-700">{task.category}</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className={priorityStyles[task.priority].text}>
              {priorityStyles[task.priority].label} Priority
            </span>

            {task.timeSpentMinutes !== undefined && task.timeSpentMinutes > 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="font-mono tabular-nums flex items-center gap-1 text-neutral-600">
                  <Clock className="w-3 h-3 inline text-neutral-400" />
                  {task.timeSpentMinutes}m
                </span>
              </>
            )}

            {task.dueDate && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="font-mono tabular-nums text-neutral-600">
                  Due {task.dueDate}
                </span>
              </>
            )}

            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="font-mono tabular-nums font-medium text-neutral-700">
              {task.progressPercent}%
            </span>
          </div>

          {/* Blocker Callout if any */}
          {task.blockerReason && (
            <div className="mt-2 text-xs bg-red-50 text-red-900 border border-red-200/80 rounded px-2.5 py-1.5 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Blocker: </span>
                <span>{task.blockerReason}</span>
              </div>
            </div>
          )}

          {/* Next Step / Tomorrow Plan */}
          {task.nextStep && (
            <div className="mt-1.5 text-xs text-neutral-600 flex items-center gap-1.5">
              <span className="font-medium text-neutral-800">Next milestone:</span>
              <span className="italic">{task.nextStep}</span>
            </div>
          )}

          {/* Progress bar and Quick WhatsApp inclusion */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            {/* Progress Adjuster */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
                Progress:
              </span>
              <div className="flex items-center gap-1">
                {[0, 25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateProgress(task.id, val)}
                    className={`px-1.5 py-0.5 text-[11px] font-mono tabular-nums rounded border transition-colors ${
                      task.progressPercent === val
                        ? 'bg-neutral-900 border-neutral-900 text-white font-semibold'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle WhatsApp update inclusion */}
            <button
              type="button"
              onClick={() => onToggleUpdateSelection(task.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors border ${
                task.selectedForUpdate
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <SendHorizontal className="w-3 h-3 text-emerald-600" />
              <span>{task.selectedForUpdate ? 'In WhatsApp update' : 'Exclude from update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
