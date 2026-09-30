import React, { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface SnackbarNotificationProps {
  message: string | null;
  onUndo?: (() => void) | null;
  onClose: () => void;
  duration?: number;
}

export const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  message,
  onUndo,
  onClose,
  duration = 4500,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    feedback('success');
    setProgress(100);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92vw] animate-in fade-in slide-in-from-bottom-5 zoom-in-95 duration-200">
      <div className="relative overflow-hidden bg-slate-900/95 dark:bg-[#15191E]/95 border border-slate-700/90 shadow-2xl rounded-2xl px-4 py-3 flex items-center space-x-3 text-xs text-white backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-in zoom-in-75 duration-200" />
        <span className="font-medium pr-1">{message}</span>

        {onUndo && (
          <button
            onClick={() => {
              feedback('toggle');
              onUndo();
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer shadow-xs shrink-0 touch-tactile"
          >
            <RotateCcw className="w-3 h-3" />
            <span>เลิกทำ</span>
          </button>
        )}

        <button
          onClick={() => {
            feedback('tap');
            onClose();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0 active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Countdown Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

