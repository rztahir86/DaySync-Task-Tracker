import React from 'react';
import { Send, CheckSquare, MessageSquareText, UserCheck, History, Plus, TrendingUp } from 'lucide-react';

export type ActiveTab = 'tasks' | 'compose' | 'analytics' | 'profile' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedTaskCount: number;
  totalActiveCount: number;
  onOpenQuickAdd: () => void;
  seniorName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedTaskCount,
  onOpenQuickAdd,
  seniorName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 -m-1"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-neutral-800 transition-colors">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors whitespace-nowrap block">
                  DaySync
                </span>
                <span className="text-[11px] text-neutral-500 hidden sm:block whitespace-nowrap">
                  Daily Tasks &amp; Senior WhatsApp Briefing
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks &amp; Agenda</span>
            </button>

            <button
              onClick={() => setActiveTab('compose')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'compose'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Briefing</span>
              {selectedTaskCount > 0 && (
                <span className="font-mono text-xs font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                  {selectedTaskCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Senior: {seniorName || 'Contact'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Sent Logs</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md shadow-xs transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Update</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for smaller viewports */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-100 text-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-1 px-2 font-medium ${activeTab === 'tasks' ? 'text-neutral-950 font-bold border-b-2 border-neutral-900' : 'text-neutral-500'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-1 px-2 font-medium flex items-center gap-1 ${activeTab === 'compose' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-neutral-500'}`}
          >
            WhatsApp ({selectedTaskCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 font-medium ${activeTab === 'analytics' ? 'text-neutral-950 font-bold border-b-2 border-neutral-900' : 'text-neutral-500'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-1 px-2 font-medium ${activeTab === 'profile' ? 'text-neutral-950 font-bold border-b-2 border-neutral-900' : 'text-neutral-500'}`}
          >
            Senior
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 px-2 font-medium ${activeTab === 'history' ? 'text-neutral-950 font-bold border-b-2 border-neutral-900' : 'text-neutral-500'}`}
          >
            Logs
          </button>
        </div>
      </div>
    </header>
  );
};
