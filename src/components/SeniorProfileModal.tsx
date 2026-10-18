import React, { useState } from 'react';
import { SeniorProfile, BriefingStyle } from '../types';
import { X, Check, Phone, Bell, MessageSquare, AlertCircle } from 'lucide-react';
import { cleanPhoneNumber } from '../utils/whatsappFormatter';

interface SeniorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SeniorProfile;
  onSave: (updated: SeniorProfile) => void;
}

export const SeniorProfileModal: React.FC<SeniorProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [titleOrRole, setTitleOrRole] = useState(profile.titleOrRole);
  const [phone, setPhone] = useState(profile.phone);
  const [senderName, setSenderName] = useState(profile.senderName);
  const [salutation, setSalutation] = useState(profile.salutation);
  const [signoff, setSignoff] = useState(profile.signoff);
  const [preferredStyle, setPreferredStyle] = useState<BriefingStyle>(profile.preferredStyle || 'executive');
  const [reminderTime, setReminderTime] = useState(profile.reminderTime || '17:30');
  const [reminderEnabled, setReminderEnabled] = useState(profile.reminderEnabled ?? true);
  const [includeBlockers, setIncludeBlockers] = useState(profile.includeBlockers ?? true);
  const [includeNextSteps, setIncludeNextSteps] = useState(profile.includeNextSteps ?? true);
  const [includeProgressPercent, setIncludeProgressPercent] = useState(profile.includeProgressPercent ?? true);
  const [includeTimeSpent, setIncludeTimeSpent] = useState(profile.includeTimeSpent ?? false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanPhoneNumber(phone);
    onSave({
      name: name.trim(),
      titleOrRole: titleOrRole.trim(),
      phone: cleaned,
      senderName: senderName.trim(),
      salutation: salutation.trim(),
      signoff: signoff.trim(),
      preferredStyle,
      reminderTime,
      reminderEnabled,
      includeBlockers,
      includeNextSteps,
      includeProgressPercent,
      includeTimeSpent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Senior &amp; WhatsApp Preferences
            </h2>
            <p className="text-xs text-neutral-500">
              Configure who receives your daily progress reports and format preferences
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

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Senior Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <span>Senior / Manager Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Senior&apos;s Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Sarah Connor"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={titleOrRole}
                  onChange={(e) => setTitleOrRole(e.target.value)}
                  placeholder="e.g. Engineering Lead, VP, Director"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 14155552671 or 447911123456 or 919876543210"
                className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Enter digits with country code (e.g. <span className="font-mono">1</span> for US/Canada, <span className="font-mono">91</span> for India, <span className="font-mono">44</span> for UK). Omit plus sign or spaces.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
              <span>Your Details &amp; Message Signature</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Your Name (Sender)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Zeeshan"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Default Salutation
                </label>
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  placeholder="e.g. Hi Alex or Hello Sir"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Default Sign-off
                </label>
                <input
                  type="text"
                  value={signoff}
                  onChange={(e) => setSignoff(e.target.value)}
                  placeholder="e.g. Best regards,\nZeeshan"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Standup Reminder */}
          <div className="pt-3 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-neutral-500" />
              <span>Daily End-of-Day Standup Reminder</span>
            </h3>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div>
                <div className="text-xs font-semibold text-neutral-900">
                  Enable Daily Standup Reminder Banner
                </div>
                <div className="text-[11px] text-neutral-500">
                  Prompts you when it&apos;s time to compile and send your progress report
                </div>
              </div>

              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {reminderEnabled && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Reminder Time (24h format)
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-neutral-500 ml-2">Typically 5:00 PM or 5:30 PM (17:30)</span>
              </div>
            )}
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
            onClick={handleFormSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Senior Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
