import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface CopyableBadgeProps {
  textToCopy: string;
  label?: React.ReactNode;
  className?: string;
  tooltipText?: string;
  title?: string;
}

export const CopyableBadge: React.FC<CopyableBadgeProps> = ({
  textToCopy,
  label,
  className = '',
  tooltipText = 'คัดลอกแล้ว ✓',
  title = 'คลิกเพื่อคัดลอก',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      feedback('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={`relative inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 group/copy ${className}`}
    >
      <span>{label || textToCopy}</span>
      <span className="shrink-0 p-0.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 group-hover/copy:text-[#1677FF] transition-colors">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-75 duration-150" />
        ) : (
          <Copy className="w-3 h-3 transition-transform group-hover/copy:scale-110" />
        )}
      </span>

      {/* Floating Micro-tooltip */}
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-semibold whitespace-nowrap shadow-lg shadow-black/20 pointer-events-none animate-in fade-in zoom-in-90 slide-in-from-bottom-1 duration-150 z-30">
          {tooltipText}
        </span>
      )}
    </button>
  );
};
