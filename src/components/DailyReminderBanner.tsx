import React, { useState, useEffect } from 'react';
import { SeniorProfile } from '../types';
import { Bell, ArrowRight, X } from 'lucide-react';

interface DailyReminderBannerProps {
  profile: SeniorProfile;
  pendingTasksCount: number;
  onOpenCompose: () => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  profile,
  pendingTasksCount,
  onOpenCompose,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [isPastReminderTime, setIsPastReminderTime] = useState(false);

  useEffect(() => {
    if (!profile.reminderEnabled || !profile.reminderTime) {
      setIsPastReminderTime(false);
      return;
    }

    const checkTime = () => {
      const now = new Date();
      const [remHours, remMinutes] = profile.reminderTime.split(':').map(Number);
      const reminderDate = new Date();
      reminderDate.setHours(remHours || 17, remMinutes || 30, 0, 0);

      // Trigger if current time is equal to or after the reminder time today
      if (now >= reminderDate) {
        setIsPastReminderTime(true);
      } else {
        setIsPastReminderTime(false);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [profile.reminderEnabled, profile.reminderTime]);

  if (!profile.reminderEnabled || !isPastReminderTime || dismissed) {
    return null;
  }

  return (
    <div className="bg-emerald-900 text-white px-4 py-3 rounded-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-emerald-800 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-emerald-300" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            Daily WhatsApp Standup Reminder ({profile.reminderTime})
          </p>
          <p className="text-xs text-emerald-200">
            You have {pendingTasksCount} tasks queued for {profile.name || 'your senior'}. Send today&apos;s progress report before signing off.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          type="button"
          onClick={onOpenCompose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded transition-colors"
        >
          <span>Review &amp; Send</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 text-emerald-300 hover:text-white transition-colors rounded"
          title="Dismiss for now"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
