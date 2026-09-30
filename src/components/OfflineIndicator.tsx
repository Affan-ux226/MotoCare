import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between gap-3 rounded-2xl bg-amber-600/95 dark:bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-400/40 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
        </div>
        <div>
          <span>โหมดออฟไลน์ (Offline Mode)</span>
          <p className="text-[10px] font-normal text-amber-100">
            ใช้งานข้อมูลแคชในเครื่อง บันทึกและเรียกดูข้อมูลได้ตามปกติ
          </p>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        <span>ลองใหม่</span>
      </button>
    </div>
  );
};
