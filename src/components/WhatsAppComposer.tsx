import React, { useState, useEffect } from 'react';
import { Task, SeniorProfile, BriefingStyle } from '../types';
import { generateWhatsAppMessage, buildWhatsAppUrls } from '../utils/whatsappFormatter';
import {
  Send,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Edit3,
  RotateCcw,
  UserCheck,
  Clock,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

interface WhatsAppComposerProps {
  tasks: Task[];
  profile: SeniorProfile;
  onUpdateTasks: (tasks: Task[]) => void;
  onSaveBriefingToHistory: (messageText: string, style: BriefingStyle) => void;
  onOpenSeniorSettings: () => void;
}

export const WhatsAppComposer: React.FC<WhatsAppComposerProps> = ({
  tasks,
  profile,
  onUpdateTasks,
  onSaveBriefingToHistory,
  onOpenSeniorSettings,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<BriefingStyle>(profile.preferredStyle || 'executive');
  const [includeBlockers, setIncludeBlockers] = useState(profile.includeBlockers ?? true);
  const [includeNextSteps, setIncludeNextSteps] = useState(profile.includeNextSteps ?? true);
  const [includeProgress, setIncludeProgress] = useState(profile.includeProgressPercent ?? true);
  const [includeTimeSpent, setIncludeTimeSpent] = useState(profile.includeTimeSpent ?? false);
  const [customNote, setCustomNote] = useState('');
  
  // Custom edited message override
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedToLog, setSavedToLog] = useState(false);

  // Auto-generate message whenever tasks or options change
  useEffect(() => {
    if (!isManualEdit) {
      const generated = generateWhatsAppMessage(tasks, profile, {
        style: selectedStyle,
        includeBlockers,
        includeNextSteps,
        includeProgressPercent: includeProgress,
        includeTimeSpent,
        customNote,
      });
      setEditedMessage(generated);
    }
  }, [
    tasks,
    profile,
    selectedStyle,
    includeBlockers,
    includeNextSteps,
    includeProgress,
    includeTimeSpent,
    customNote,
    isManualEdit,
  ]);

  const selectedTasks = tasks.filter((t) => t.selectedForUpdate);
  const completedCount = selectedTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = selectedTasks.filter((t) => t.status === 'in_progress').length;
  const blockedCount = selectedTasks.filter((t) => t.status === 'blocked').length;

  const handleTaskToggle = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, selectedForUpdate: !t.selectedForUpdate } : t
    );
    onUpdateTasks(updated);
  };

  const handleSelectAll = (select: boolean) => {
    const updated = tasks.map((t) => ({ ...t, selectedForUpdate: select }));
    onUpdateTasks(updated);
  };

  const handleSelectCompletedOnly = () => {
    const updated = tasks.map((t) => ({
      ...t,
      selectedForUpdate: t.status === 'completed',
    }));
    onUpdateTasks(updated);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const { universalUrl, webUrl } = buildWhatsAppUrls(profile.phone, editedMessage);

  const handleSendWhatsApp = () => {
    // Record into history
    onSaveBriefingToHistory(editedMessage, selectedStyle);
    setSavedToLog(true);
    setTimeout(() => setSavedToLog(false), 3000);

    // Open WhatsApp URL
    window.open(universalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsAppWeb = () => {
    onSaveBriefingToHistory(editedMessage, selectedStyle);
    setSavedToLog(true);
    setTimeout(() => setSavedToLog(false), 3000);

    window.open(webUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Update - ${new Date().toLocaleDateString()}`,
          text: editedMessage,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleResetToAuto = () => {
    setIsManualEdit(false);
    const generated = generateWhatsAppMessage(tasks, profile, {
      style: selectedStyle,
      includeBlockers,
      includeNextSteps,
      includeProgressPercent: includeProgress,
      includeTimeSpent,
      customNote,
    });
    setEditedMessage(generated);
  };

  return (
    <div className="space-y-6">
      {/* Recipient Quick Info Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'SR'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                Sending to: {profile.name || 'Senior Name'}
              </h2>
              {profile.titleOrRole && (
                <span className="text-xs text-neutral-500">({profile.titleOrRole})</span>
              )}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
              <span>WhatsApp:</span>
              <span className="font-mono text-neutral-800 font-medium">
                {profile.phone ? `+${profile.phone}` : 'No phone set'}
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>Sender: <strong className="text-neutral-700">{profile.senderName || 'You'}</strong></span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSeniorSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap self-end sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Edit Senior Details</span>
        </button>
      </div>

      {/* Main 2-Column Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration, Presets & Task Selection */}
        <div className="lg:col-span-6 space-y-5">
          {/* Style Presets */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>Update Format Preset</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'executive', label: 'Executive Brief', desc: 'Accomplishments & Next Steps' },
                { id: 'standup', label: 'Daily Standup', desc: 'Done, Doing, Blockers' },
                { id: 'detailed', label: 'End-of-Day EOD', desc: 'Deliverables, minutes & notes' },
                { id: 'bullet', label: 'Bullet Points', desc: 'Clean, direct status list' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setSelectedStyle(style.id as BriefingStyle);
                    setIsManualEdit(false);
                  }}
                  className={`text-left p-2.5 rounded-md border transition-all ${
                    selectedStyle === style.id
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-50/70 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-xs font-semibold">{style.label}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedStyle === style.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Formatting Toggles */}
            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProgress}
                  onChange={(e) => {
                    setIncludeProgress(e.target.checked);
                    setIsManualEdit(false);
                  }}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>Include Progress %</span>
              </label>

              <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBlockers}
                  onChange={(e) => {
                    setIncludeBlockers(e.target.checked);
                    setIsManualEdit(false);
                  }}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>Include Blockers</span>
              </label>

              <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNextSteps}
                  onChange={(e) => {
                    setIncludeNextSteps(e.target.checked);
                    setIsManualEdit(false);
                  }}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>Include Next Milestones</span>
              </label>

              <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimeSpent}
                  onChange={(e) => {
                    setIncludeTimeSpent(e.target.checked);
                    setIsManualEdit(false);
                  }}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>Include Time Spent</span>
              </label>
            </div>

            {/* Custom Day Note */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Custom Note for Today (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => {
                  setCustomNote(e.target.value);
                  setIsManualEdit(false);
                }}
                placeholder="e.g. Please approve PR #42 when you have 5 mins."
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tasks Included in Update */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Select Tasks for Today&apos;s Update
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {selectedTasks.length} tasks selected ({completedCount} done, {inProgressCount} active, {blockedCount} blocked)
                </p>
              </div>

              {/* Quick Bulk Select Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="px-2 py-1 text-neutral-600 hover:text-neutral-900 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleSelectCompletedOnly}
                  className="px-2 py-1 text-neutral-600 hover:text-neutral-900 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Done Only
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="px-2 py-1 text-neutral-600 hover:text-neutral-900 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Task Checklist */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  No tasks recorded yet. Add tasks from the Tasks tab!
                </div>
              ) : (
                tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-md border transition-colors cursor-pointer text-xs ${
                      task.selectedForUpdate
                        ? 'bg-neutral-50/80 border-neutral-300'
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={task.selectedForUpdate}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer shrink-0"
                      />
                      <span className={`truncate ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900 font-medium'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono tabular-nums">
                      <span className="text-neutral-500 font-sans">{task.category}</span>
                      <span className="font-semibold">{task.progressPercent}%</span>
                      {task.status === 'completed' && <span className="text-emerald-700 font-semibold font-sans">Done</span>}
                      {task.status === 'blocked' && <span className="text-red-700 font-semibold font-sans">Blocked</span>}
                      {task.status === 'in_progress' && <span className="text-amber-700 font-semibold font-sans">Active</span>}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Live Phone Preview & Direct Send */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
            {/* Phone WhatsApp Frame Header */}
            <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'SR'}
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                    <span>{profile.name || 'Senior Contact'}</span>
                  </div>
                  <div className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span>WhatsApp</span>
                    <span>·</span>
                    <span>{profile.phone ? `+${profile.phone}` : 'Preview mode'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualEdit(!isManualEdit)}
                  className={`px-2 py-1 text-[11px] font-medium rounded flex items-center gap-1 transition-colors ${
                    isManualEdit
                      ? 'bg-white text-emerald-900 font-bold'
                      : 'bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100'
                  }`}
                  title="Toggle manual text edit"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isManualEdit ? 'Auto Sync' : 'Direct Edit'}</span>
                </button>

                {isManualEdit && (
                  <button
                    type="button"
                    onClick={handleResetToAuto}
                    className="p-1 text-emerald-200 hover:text-white rounded"
                    title="Reset to generated text"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Body simulating WhatsApp chat background */}
            <div className="p-4 bg-[#EFEAE2] min-h-[380px] max-h-[460px] overflow-y-auto">
              {/* WhatsApp message bubble */}
              <div className="max-w-[94%] ml-auto bg-[#E7FFDB] rounded-lg p-3 text-neutral-900 shadow-xs border border-emerald-950/5 relative">
                {isManualEdit ? (
                  <textarea
                    rows={14}
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="w-full text-xs font-sans leading-relaxed bg-transparent border-0 focus:outline-none resize-y"
                    placeholder="Type or edit your WhatsApp update message here..."
                  />
                ) : (
                  <div className="text-xs font-sans whitespace-pre-wrap leading-relaxed select-text">
                    {editedMessage}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-neutral-500 font-mono">
                  <span>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* WhatsApp double checkmarks */}
                  <span className="text-sky-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col gap-2.5">
              {/* Primary Direct WhatsApp Send */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp App</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppWeb}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-md transition-colors whitespace-nowrap"
                  title="Open in WhatsApp Web for desktop browser"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  <span>WhatsApp Web</span>
                </button>
              </div>

              {/* Secondary Utility Actions: Copy, Share, Record */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Share</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSaveBriefingToHistory(editedMessage, selectedStyle);
                    setSavedToLog(true);
                    setTimeout(() => setSavedToLog(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 rounded transition-colors"
                  title="Save message snapshot to History log without opening WhatsApp"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{savedToLog ? 'Saved to Log!' : 'Save to Log'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Helpful Tip */}
          <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-md text-[11px] text-neutral-600 leading-relaxed">
            <span className="font-semibold text-neutral-800">Pro-Tip: </span>
            Clicking <strong>Send via WhatsApp</strong> opens a direct chat with your senior pre-loaded with this formatted text. If your phone or WhatsApp desktop is linked, simply press return to send!
          </div>
        </div>
      </div>
    </div>
  );
};
