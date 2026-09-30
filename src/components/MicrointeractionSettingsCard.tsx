import React, { useState } from 'react';
import {
  Vibrate,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Gauge,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  isHapticsEnabled,
  setHapticsEnabled,
  isSoundEnabled,
  setSoundEnabled,
  feedback,
  triggerHaptic,
  playSound,
} from '../utils/feedback';

interface MicrointeractionSettingsCardProps {
  onNotifyChange?: (msg: string) => void;
}

export const MicrointeractionSettingsCard: React.FC<MicrointeractionSettingsCardProps> = ({
  onNotifyChange,
}) => {
  const [haptics, setHaptics] = useState<boolean>(() => isHapticsEnabled());
  const [sound, setSound] = useState<boolean>(() => isSoundEnabled());
  const [lastTested, setLastTested] = useState<string | null>(null);

  const handleToggleHaptics = (enabled: boolean) => {
    setHaptics(enabled);
    setHapticsEnabled(enabled);
    if (enabled) {
      triggerHaptic('medium');
    }
    if (onNotifyChange) {
      onNotifyChange(enabled ? 'เปิดระบบสั่นตอบสนอง (Haptics) แล้ว' : 'ปิดระบบสั่นตอบสนองแล้ว');
    }
  };

  const handleToggleSound = (enabled: boolean) => {
    setSound(enabled);
    setSoundEnabled(enabled);
    if (enabled) {
      playSound('toggle');
    }
    if (onNotifyChange) {
      onNotifyChange(enabled ? 'เปิดเสียงเอฟเฟกต์โต้ตอบแล้ว' : 'ปิดเสียงเอฟเฟกต์แล้ว');
    }
  };

  const runTest = (type: 'tap' | 'odometer' | 'success' | 'alert' | 'toggle', label: string) => {
    feedback(type);
    setLastTested(label);
    setTimeout(() => setLastTested(null), 1800);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              การตอบสนองเชิงโต้ตอบ (Microinteractions)
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">
              เสียงคลิกและแรงสั่นสัมผัสขนาดเล็กเพื่อเพิ่มประสบการณ์ใช้งานที่ลื่นไหล
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] font-semibold border border-[#1677FF]/30">
          Tactile & Audio
        </span>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Haptic Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">ระบบสั่นสัมผัส (Haptics)</p>
              <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">สั่นเบาๆ ขณะกดปุ่มบนมือถือ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleHaptics(!haptics)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              haptics ? 'bg-[#1677FF]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                haptics ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">เสียงเอฟเฟกต์สังเคราะห์ (Sound)</p>
              <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">เสียงสั้นนุ่มนวล ไม่รบกวน</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSound(!sound)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              sound ? 'bg-[#1677FF]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                sound ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Interactive Testing Playground */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#A7ADB5] uppercase tracking-wider">
            ทดลองสัมผัสการตอบสนองทันที:
          </span>
          {lastTested && (
            <span className="text-[11px] font-semibold text-emerald-500 animate-in fade-in duration-150">
              {lastTested} ✓
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => runTest('tap', 'ปุ่มทั่วไป (Tap)')}
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>แตะปุ่ม</span>
          </button>

          <button
            type="button"
            onClick={() => runTest('odometer', 'เสียงจดไมล์ (Gauge)')}
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Gauge className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>จดไมล์</span>
          </button>

          <button
            type="button"
            onClick={() => runTest('toggle', 'สลับโหมด (Toggle)')}
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>สลับค่า</span>
          </button>

          <button
            type="button"
            onClick={() => runTest('success', 'บันทึกสำเร็จ (Success)')}
            className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>สำเร็จ</span>
          </button>

          <button
            type="button"
            onClick={() => runTest('alert', 'แจ้งเตือน (Alert)')}
            className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>เตือน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
