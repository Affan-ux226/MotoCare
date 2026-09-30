import React from 'react';
import { MotorcycleProfile, UserProfile, UserSession } from '../types';
import { feedback } from '../utils/feedback';
import {
  Bike,
  Gauge,
  Sparkles,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  Settings,
  Database,
  Check,
  Wrench,
  Fuel,
  FileText,
  BarChart3,
  Home,
  User,
  LogOut,
  LogIn,
  History,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface DesktopSidebarProps {
  activeBike: MotorcycleProfile;
  bikes: MotorcycleProfile[];
  onSelectBike: (bikeId: string) => void;
  onOpenAddBikeModal: () => void;
  onOpenEditBikeModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMileageModal: () => void;
  onOpenQuickAddModal: () => void;
  onOpenDataModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOilOverdue: boolean;
  dueSoonCount: number;
  session?: UserSession | null;
  userProfile: UserProfile;
  onLogoutClick?: () => void;
  onOpenLogin?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeBike,
  bikes,
  onSelectBike,
  onOpenAddBikeModal,
  onOpenEditBikeModal,
  activeTab,
  setActiveTab,
  onOpenMileageModal,
  onOpenQuickAddModal,
  onOpenDataModal,
  isDarkMode,
  onToggleDarkMode,
  isOilOverdue,
  dueSoonCount,
  session,
  userProfile,
  onLogoutClick,
  onOpenLogin,
}) => {
  const [isBikePickerOpen, setIsBikePickerOpen] = React.useState(false);

  const handleTabClick = (tabId: string) => {
    feedback('tap');
    setActiveTab(tabId);
  };

  const handleToggleTheme = () => {
    feedback('toggle');
    onToggleDarkMode();
  };

  const navLinks = [
    { id: 'overview', label: 'หน้าหลัก', desc: 'ภาพรวม & สรุปสถานะ', icon: Home },
    { id: 'garage', label: 'โรงรถ', desc: `${bikes.length} คันในระบบ`, icon: Bike },
    {
      id: 'maintenance',
      label: 'การบำรุงรักษา',
      desc: 'ตรวจเช็ค 9 รายการ',
      icon: Wrench,
      badge: isOilOverdue ? '🔴 เกินระยะ' : dueSoonCount > 0 ? '🟡 ใกล้กำหนด' : undefined,
      badgeColor: isOilOverdue ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10',
    },
    { id: 'fuel', label: 'บันทึกน้ำมัน', desc: 'อัตราสิ้นเปลือง กม./ลิตร', icon: Fuel },
    { id: 'expenses', label: 'ค่าใช้จ่าย & การเงิน', desc: 'วิเคราะห์รายจ่าย', icon: BarChart3 },
    { id: 'history', label: 'ประวัติการซ่อม', desc: 'บันทึกอะไหล่ & ซ่อมบำรุง', icon: History },
    { id: 'documents', label: 'เอกสาร & ภาษี', desc: 'พ.ร.บ. / ป้ายวงกลม', icon: FileText },
    { id: 'chat', label: 'ช่าง AI ถาม-ตอบ', desc: 'ที่ปรึกษาปัญหาเครื่องยนต์', icon: Sparkles, isAi: true },
    { id: 'profile', label: 'โปรไฟล์ & บัญชี', desc: session ? session.name : 'ผู้เยี่ยมชม', icon: User },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col shrink-0 h-screen sticky top-0 bg-white dark:bg-[#15191E] border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] flex items-center justify-center text-white shadow-md shadow-[#1677FF]/30 ring-1 ring-white/10 shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  MotoCare
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] font-mono font-semibold border border-[#1677FF]/30">
                  Test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5] truncate">
                Omnichannel Care App
              </p>
            </div>
          </div>

          {/* Quick theme toggle */}
          <button
            onClick={handleToggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-850 active:scale-95 text-slate-600 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-200 dark:border-slate-800 touch-tactile"
            title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            aria-label="เปลี่ยนธีม"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#F59E0B] transition-transform duration-300 hover:rotate-45" /> : <Moon className="w-4 h-4 text-[#1677FF] transition-transform duration-300 hover:-rotate-12" />}
          </button>
        </div>

        {/* Current Vehicle Selector Card */}
        <div className="mt-4 relative">
          <div
            onClick={() => {
              feedback('tap');
              setIsBikePickerOpen(!isBikePickerOpen);
            }}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 hover:border-[#1677FF]/50 transition cursor-pointer flex items-center justify-between group touch-tactile"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30 shrink-0">
                <Bike className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1677FF] transition-colors">
                  {activeBike.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#A7ADB5] font-mono truncate">
                  {activeBike.plateNumber} • {activeBike.currentMileage.toLocaleString()} km
                </div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 ml-1 transition-transform duration-200 ${isBikePickerOpen ? 'rotate-180 text-[#1677FF]' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isBikePickerOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsBikePickerOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-[#A7ADB5] flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <span>รถในครอบครอง</span>
                  <span className="text-[#1677FF] font-mono">{bikes.length} คัน</span>
                </div>
                <div className="py-1 max-h-52 overflow-y-auto space-y-1">
                  {bikes.map((b) => {
                    const isSelected = b.id === activeBike.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          feedback('success');
                          onSelectBike(b.id);
                          setIsBikePickerOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer active:scale-98 touch-tactile ${
                          isSelected
                            ? 'bg-[#1677FF]/15 text-[#1677FF] font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-[#0B0D10] text-slate-700 dark:text-[#A7ADB5]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-semibold">{b.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {b.plateNumber} ({b.currentMileage.toLocaleString()} km)
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1677FF] shrink-0 animate-in zoom-in-75 duration-150" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5">
                  <button
                    onClick={() => {
                      feedback('click');
                      setIsBikePickerOpen(false);
                      onOpenAddBikeModal();
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer touch-tactile"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรถ</span>
                  </button>
                  <button
                    onClick={() => {
                      feedback('tap');
                      setIsBikePickerOpen(false);
                      onOpenEditBikeModal();
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-600 dark:text-[#A7ADB5] text-[11px] flex items-center justify-center cursor-pointer touch-tactile"
                    title="แก้ไขรถ"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Action Buttons Bar */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              feedback('odometer');
              onOpenMileageModal();
            }}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-850 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer touch-tactile"
          >
            <Gauge className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>จดไมล์</span>
          </button>
          <button
            onClick={() => {
              feedback('click');
              onOpenQuickAddModal();
            }}
            className="py-2 px-3 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-xs font-semibold shadow-md shadow-[#1677FF]/25 flex items-center justify-center gap-1.5 transition cursor-pointer touch-tactile"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>เพิ่มข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-[#A7ADB5] uppercase tracking-wider">
          เมนูหลัก
        </div>

        {navLinks.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full px-3 py-2.5 rounded-2xl text-left transition-all duration-150 flex items-center justify-between cursor-pointer group active:scale-98 touch-tactile ${
                isActive
                  ? 'bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/30 font-semibold'
                  : 'text-slate-600 dark:text-[#A7ADB5] hover:bg-slate-100 dark:hover:bg-[#0B0D10] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.isAi
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-slate-100 dark:bg-[#0B0D10] text-slate-500 dark:text-[#A7ADB5] group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <div className="truncate">
                  <span className="text-xs block leading-tight truncate">{item.label}</span>
                  <span
                    className={`text-[10px] block leading-tight truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* PWA Install Promo in Sidebar */}
        <div className="pt-3">
          <PWAInstallButton variant="sidebar" />
        </div>
      </nav>

      {/* Footer / Account status */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B0D10]/50 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800">
          <div
            onClick={() => handleTabClick('profile')}
            className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center font-bold text-xs shrink-0">
              {session ? session.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {session ? session.name : 'ผู้เยี่ยมชม (Guest)'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {session ? session.email : 'ไม่ได้เข้าสู่ระบบ'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => {
                feedback('tap');
                onOpenDataModal();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B0D10] transition cursor-pointer touch-tactile"
              title="สำรอง / จัดการข้อมูล"
            >
              <Database className="w-4 h-4" />
            </button>
            {session && onLogoutClick ? (
              <button
                onClick={() => {
                  feedback('alert');
                  onLogoutClick();
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition cursor-pointer touch-tactile"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : !session && onOpenLogin ? (
              <button
                onClick={() => {
                  feedback('click');
                  onOpenLogin();
                }}
                className="p-1.5 rounded-lg text-[#1677FF] hover:bg-[#1677FF]/15 transition cursor-pointer touch-tactile"
                title="เข้าสู่ระบบ"
              >
                <LogIn className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
};

