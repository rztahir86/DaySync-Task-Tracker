import React, { useState } from 'react';
import { BriefingHistoryItem } from '../types';
import { History, Copy, Check, Trash2, Calendar, FileText, SendHorizontal } from 'lucide-react';

interface HistoryViewProps {
  history: BriefingHistoryItem[];
  onClearHistory: () => void;
  onOpenInWhatsApp: (phone: string, text: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onOpenInWhatsApp,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy history item:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-600" />
            <span>Sent WhatsApp Updates Archive</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Keep track of past messages and status updates reported to your senior
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">No sent updates logged yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            When you send or log your daily updates to WhatsApp, they will be archived here for easy reference.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all hover:border-neutral-300"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      WA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">
                          {item.recipientName || 'Senior'}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          +{item.recipientPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums mt-0.5">
                        <Calendar className="w-3 h-3 text-neutral-400 inline" />
                        <span>{dateStr} at {timeStr}</span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="capitalize font-sans text-neutral-600">{item.style} style</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.messageText)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenInWhatsApp(item.recipientPhone, item.messageText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                      title="Re-open in WhatsApp"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>Open WA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded border border-transparent hover:border-neutral-200"
                    >
                      {isExpanded ? 'Collapse' : 'View'}
                    </button>
                  </div>
                </div>

                {/* Message preview snippet or full body */}
                <div className="p-4 sm:p-5">
                  <div
                    className={`text-xs font-mono whitespace-pre-wrap leading-relaxed text-neutral-800 bg-neutral-50 p-3.5 rounded border border-neutral-200/80 ${
                      !isExpanded ? 'line-clamp-4' : ''
                    }`}
                  >
                    {item.messageText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
