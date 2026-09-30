import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Share2, PlusSquare, X, Check, Laptop, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'sidebar' | 'icon';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone PWA mode
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className={`px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 ${className}`}>
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium truncate">ติดตั้งเป็นแอปแล้ว</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions modal for browsers that don't trigger beforeinstallprompt yet
      setShowIOSGuide(true);
    }
  };

  const modal = showIOSGuide && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={() => setShowIOSGuide(false)}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                วิธีติดตั้ง MotoCare ลงเครื่อง
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">
                {isIOS ? 'สำหรับ iPhone / iPad (Safari)' : 'สำหรับคอมพิวเตอร์และมือถือ'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSGuide(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  แตะปุ่มแชร์ <Share2 className="w-3.5 h-3.5 text-[#1677FF]" />
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] mt-0.5">
                  ที่แถบเมนูด้านล่างของ Safari
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  เลือก "เพิ่มไปยังหน้าจอโฮม" <PlusSquare className="w-3.5 h-3.5 text-emerald-500" />
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] mt-0.5">
                  (Add to Home Screen)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  กดปุ่ม "เพิ่ม" (Add) มุมขวาบน
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] mt-0.5">
                  แอปจะปรากฏบนหน้าจอเหมือนแอปพลิเคชันปกติทันที
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
              <Laptop className="w-5 h-5 text-[#1677FF] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  คอมพิวเตอร์ (Chrome / Edge):
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] mt-0.5">
                  คลิกไอคอน <strong>"ติดตั้งแอป" (Install)</strong> ที่แถบ URL ด้านขวาบนสุด หรือเมนูสามจุด ⋮
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
              <Smartphone className="w-5 h-5 text-[#1677FF] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  มือถือ Android:
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] mt-0.5">
                  แตะเมนูสามจุด ⋮ ที่มุมขวาบนของเบราว์เซอร์ แล้วเลือก <strong>"ติดตั้งแอป"</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowIOSGuide(false)}
          className="w-full py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-xs font-bold transition cursor-pointer"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );

  // Compact variant (e.g. for header)
  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`h-11 px-3 sm:px-4 min-w-[44px] min-h-[44px] flex items-center space-x-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 active:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all duration-150 cursor-pointer shrink-0 ${className}`}
          title="ติดตั้งแอปลงเครื่อง (PWA)"
          aria-label="ติดตั้งแอปลงเครื่อง"
        >
          <Download className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="hidden sm:inline font-medium">ติดตั้งแอป</span>
        </button>
        {modal}
      </>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-850 active:scale-95 active:bg-slate-300 dark:active:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 transition-all duration-150 cursor-pointer shadow-xs shrink-0 ${className}`}
          title="ติดตั้งแอปลงเครื่อง (PWA)"
          aria-label="ติดตั้งแอปลงเครื่อง"
        >
          <Download className="w-5 h-5 stroke-[2.2]" />
        </button>
        {modal}
      </>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600/15 to-blue-600/15 hover:from-emerald-600/25 hover:to-blue-600/25 active:scale-98 border border-emerald-500/30 text-left transition-all duration-150 flex items-center gap-3 cursor-pointer group ${className}`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>ติดตั้ง MotoCare</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] truncate">
              {isInstallable ? 'คลิกเพื่อติดตั้งเป็นแอป' : 'ใช้งานเหมือนแอปจริง'}
            </p>
          </div>
        </button>
        {modal}
      </>
    );
  }

  // Full banner / button variant
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`w-full py-3 px-4 rounded-2xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-sm font-bold shadow-lg shadow-[#1677FF]/30 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>ติดตั้งแอปลงในอุปกรณ์ (Install App)</span>
      </button>
      {modal}
    </>
  );
};
