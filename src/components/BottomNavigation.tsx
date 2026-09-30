import React from 'react';
import { Home, Wrench, Plus, Sparkles, User } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface BottomNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  isOilOverdue?: boolean;
  dueSoonCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  isOilOverdue = false,
  dueSoonCount = 0,
}) => {
  const handleTabClick = (tab: string) => {
    feedback('tap');
    onSelectTab(tab);
  };

  const handleQuickAddClick = () => {
    feedback('click');
    onOpenQuickAdd();
  };

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="เมนูหลักด้านล่าง"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#15191E]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 px-3 py-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors duration-200"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* เมนู 1: หน้าหลัก (Home) */}
        <button
          onClick={() => handleTabClick('overview')}
          className={`min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-90 touch-tactile ${
            activeTab === 'overview'
              ? 'text-[#1677FF] bg-[#1677FF]/15 shadow-xs font-semibold'
              : 'text-slate-500 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="หน้าหลัก"
          aria-label="หน้าหลัก"
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'overview' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">หน้าหลัก</span>
          {activeTab === 'overview' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1677FF]" />
          )}
        </button>

        {/* เมนู 2: การบำรุงรักษา (Maintenance) */}
        <button
          onClick={() => handleTabClick('maintenance')}
          className={`min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-90 touch-tactile ${
            activeTab === 'maintenance'
              ? 'text-[#1677FF] bg-[#1677FF]/15 shadow-xs font-semibold'
              : 'text-slate-500 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="การบำรุงรักษา"
          aria-label="การบำรุงรักษา"
        >
          <Wrench className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'maintenance' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">บำรุงรักษา</span>
          {(isOilOverdue || dueSoonCount > 0) && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping ring-2 ring-white dark:ring-[#15191E]" />
          )}
          {activeTab === 'maintenance' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1677FF]" />
          )}
        </button>

        {/* เมนูตรงกลาง (Center): ＋ เพิ่มข้อมูล (Quick Add Button พร้อม microinteraction pulse) */}
        <button
          onClick={handleQuickAddClick}
          className="min-w-[50px] min-h-[50px] w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] hover:brightness-110 active:scale-90 text-white flex flex-col items-center justify-center shadow-lg shadow-[#1677FF]/40 transition -mt-4 border-2 border-white dark:border-[#15191E] cursor-pointer group/add touch-tactile"
          title="เพิ่มข้อมูล (＋)"
          aria-label="เพิ่มข้อมูล"
        >
          <Plus className="w-6 h-6 stroke-[2.5] transition-transform duration-200 group-hover/add:rotate-90 group-active/add:scale-110" />
        </button>

        {/* เมนู 4: ช่าง AI ผู้ช่วยดูแลมอเตอร์ไซค์ (AI Assistant) */}
        <button
          onClick={() => handleTabClick('chat')}
          className={`min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-90 touch-tactile ${
            activeTab === 'chat'
              ? 'text-[#1677FF] bg-[#1677FF]/15 shadow-xs font-semibold'
              : 'text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
          }`}
          title="ช่าง AI ผู้ช่วยดูแลมอเตอร์ไซค์"
          aria-label="ช่าง AI ผู้ช่วยดูแลมอเตอร์ไซค์"
        >
          <Sparkles className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'chat' ? 'scale-110 rotate-12' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">ช่าง AI</span>
          {activeTab === 'chat' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1677FF]" />
          )}
        </button>

        {/* เมนู 5: โปรไฟล์ & บัญชี (Profile) */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-90 touch-tactile ${
            activeTab === 'profile'
              ? 'text-[#1677FF] bg-[#1677FF]/15 shadow-xs font-semibold'
              : 'text-slate-500 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="โปรไฟล์"
          aria-label="โปรไฟล์"
        >
          <User className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'profile' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">โปรไฟล์</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1677FF]" />
          )}
        </button>
      </div>
    </nav>
  );
};

