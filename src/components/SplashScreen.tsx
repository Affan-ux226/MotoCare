import React, { useEffect, useState } from 'react';
import { Bike, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeState, setFadeState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    // Start visible immediately
    setFadeState('visible');

    // After 1.7 seconds, start smooth exit animation
    const exitTimer = setTimeout(() => {
      setFadeState('exiting');
    }, 1700);

    // After 2.1 seconds total, complete splash
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0D10] text-white transition-opacity duration-400 ease-in-out select-none ${
        fadeState === 'exiting' ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-[#1677FF]/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute w-64 h-64 bg-[#0D5FD1]/10 rounded-full blur-2xl pointer-events-none -translate-y-20"></div>

      {/* Main Splash Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-6">
        {/* Animated App Icon */}
        <div className="relative">
          {/* Outer glowing pulsing ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] opacity-40 blur-md animate-pulse"></div>
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] p-0.5 shadow-2xl shadow-[#1677FF]/40 border border-white/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#15191E]/90 flex items-center justify-center">
              <Bike className="w-12 h-12 sm:w-14 sm:h-14 text-[#1677FF] drop-shadow-[0_0_12px_rgba(22,119,255,0.8)]" />
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1677FF] border-2 border-[#0B0D10] flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* App Title & Tagline (Requirement 31.1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              MotoCare
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1677FF]/20 text-[#1677FF] border border-[#1677FF]/40">
              Test
            </span>
          </div>

          <p className="text-base sm:text-lg text-[#A7ADB5] font-normal tracking-wide">
            ดูแลรถของคุณให้ง่ายขึ้น
          </p>
        </div>

        {/* Sleek loading line indicator */}
        <div className="pt-6 w-48 sm:w-56">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#1677FF] to-blue-300 rounded-full animate-[progress_1.6s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center text-xs text-slate-600 flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#1677FF]" />
        <span>ระบบจัดการและดูแลรักษารถมอเตอร์ไซค์อัจฉริยะ</span>
      </div>
    </div>
  );
};
