import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, SendHorizontal } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
  onFilterByStatus?: (status: string) => void;
  activeStatusFilter: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  tasks,
  onFilterByStatus,
  activeStatusFilter,
}) => {
  const completed = tasks.filter((t) => t.status === 'completed');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const blocked = tasks.filter((t) => t.status === 'blocked');
  const todo = tasks.filter((t) => t.status === 'todo');
  const selectedForUpdate = tasks.filter((t) => t.selectedForUpdate);

  const total = tasks.length;
  const completionPercentage = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
          {/* Completed */}
          <button
            type="button"
            onClick={() => onFilterByStatus?.(activeStatusFilter === 'completed' ? 'all' : 'completed')}
            className={`text-left p-3 rounded-md transition-colors border ${
              activeStatusFilter === 'completed'
                ? 'bg-neutral-100 border-neutral-400'
                : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-medium">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
                {completed.length}
              </span>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                {completionPercentage}% done
              </span>
            </div>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => onFilterByStatus?.(activeStatusFilter === 'in_progress' ? 'all' : 'in_progress')}
            className={`text-left p-3 rounded-md transition-colors border ${
              activeStatusFilter === 'in_progress'
                ? 'bg-neutral-100 border-neutral-400'
                : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-medium">In Progress</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
                {inProgress.length}
              </span>
              <span className="text-xs text-neutral-500">active now</span>
            </div>
          </button>

          {/* Blockers */}
          <button
            type="button"
            onClick={() => onFilterByStatus?.(activeStatusFilter === 'blocked' ? 'all' : 'blocked')}
            className={`text-left p-3 rounded-md transition-colors border ${
              activeStatusFilter === 'blocked'
                ? 'bg-red-50 border-red-300'
                : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-medium text-red-700">Blockers</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-red-700 font-mono tabular-nums">
                {blocked.length}
              </span>
              <span className="text-xs text-red-600/80">needs senior help</span>
            </div>
          </button>

          {/* Backlog / Todo */}
          <button
            type="button"
            onClick={() => onFilterByStatus?.(activeStatusFilter === 'todo' ? 'all' : 'todo')}
            className={`text-left p-3 rounded-md transition-colors border ${
              activeStatusFilter === 'todo'
                ? 'bg-neutral-100 border-neutral-400'
                : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-medium">To Do / Next</span>
              <ListTodo className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
                {todo.length}
              </span>
              <span className="text-xs text-neutral-500">queued</span>
            </div>
          </button>
        </div>

        {/* WhatsApp Briefing Queue Ribbon */}
        <div className="lg:w-72 p-3 bg-neutral-900 text-white rounded-md flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <SendHorizontal className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp Update Digest</span>
            </div>
            <div className="text-sm font-semibold mt-0.5">
              <span className="text-emerald-400 font-mono tabular-nums">{selectedForUpdate.length}</span> of{' '}
              <span className="font-mono tabular-nums">{total}</span> tasks included
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 font-mono block">
              {completed.filter((t) => t.selectedForUpdate).length} done · {inProgress.filter((t) => t.selectedForUpdate).length} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
