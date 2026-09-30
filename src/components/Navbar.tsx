import React, { useState } from 'react';
import { MotorcycleProfile, UserProfile, UserSession } from '../types';
import { feedback } from '../utils/feedback';
import {
  Bike,
  ChevronDown,
  Gauge,
  Plus,
  Settings,
  Check,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  bike: MotorcycleProfile;
  bikes: MotorcycleProfile[];
  onSelectBike: (bikeId: string) => void;
  onOpenAddBikeModal: () => void;
  onOpenEditBikeModal: () => void;
  userProfile: UserProfile;
  onEditUserProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMileageModal: () => void;
  onOpenQuickAddModal: () => void;
  onOpenDataModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOilOverdue: boolean;
  dueSoonCount: number;
  onLogoutClick?: () => void;
  session?: UserSession | null;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bike,
  bikes = [],
  onSelectBike,
  onOpenAddBikeModal,
  onOpenEditBikeModal,
  userProfile,
  onEditUserProfile,
  activeTab,
  setActiveTab,
  onOpenMileageModal,
  onOpenQuickAddModal,
  isDarkMode,
  onToggleDarkMode,
  session,
  onOpenLogin,
}) => {
  const [isBikePickerOpen, setIsBikePickerOpen] = useState(false);

  const handleToggleTheme = () => {
    feedback('toggle');
    onToggleDarkMode();
  };

  const handleSelectVehicle = (id: string) => {
    feedback('success');
    onSelectBike(id);
    setIsBikePickerOpen(false);
  };

  const handleOpenMileage = () => {
    feedback('odometer');
    onOpenMileageModal();
  };

  const handleOpenQuickAdd = () => {
    feedback('click');
    onOpenQuickAddModal();
  };

  return (
    <header className="lg:hidden w-full bg-white/95 dark:bg-[#15191E]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none sticky top-0 z-30 transition-colors duration-200 shadow-xs">
      <div className="p-3 sm:p-4 max-w-md mx-auto sm:max-w-2xl">
        {/* Brand & Quick Actions Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] flex items-center justify-center text-white shadow-md shadow-[#1677FF]/30 ring-1 ring-white/10 shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MotoCare
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] font-mono font-semibold border border-[#1677FF]/30">
                  Test
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5] truncate">
                Omnichannel Care App
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark / Light Mode Toggle with spin microinteraction */}
            <button
              onClick={handleToggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-850 active:scale-90 text-slate-600 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-transform duration-200 cursor-pointer border border-slate-200 dark:border-slate-800 touch-tactile"
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              aria-label="เปลี่ยนธีม"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#F59E0B] transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#1677FF] transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Profile / Account Trigger */}
            <button
              onClick={() => {
                feedback('tap');
                setActiveTab('profile');
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-850 active:scale-90 text-slate-600 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-transform duration-200 cursor-pointer border border-slate-200 dark:border-slate-800 touch-tactile"
              title="โปรไฟล์ผู้ใช้งาน"
              aria-label="โปรไฟล์"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Vehicle Selector Card */}
        <div className="relative">
          <div
            onClick={() => {
              feedback('tap');
              setIsBikePickerOpen(!isBikePickerOpen);
            }}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 hover:border-[#1677FF]/50 transition cursor-pointer flex items-center justify-between group active:scale-[0.99] touch-tactile"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30 shrink-0">
                <Bike className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1677FF] transition-colors">
                  {bike.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#A7ADB5] font-mono truncate">
                  {bike.plateNumber} • {bike.currentMileage.toLocaleString()} km
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 ml-1 transition-transform duration-200 ${
                isBikePickerOpen ? 'rotate-180 text-[#1677FF]' : ''
              }`}
            />
          </div>

          {/* Dropdown Menu for Vehicle Switching */}
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
                <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                  {bikes.map((b) => {
                    const isSelected = b.id === bike.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleSelectVehicle(b.id)}
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
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition shadow-xs touch-tactile"
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
                    className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-600 dark:text-[#A7ADB5] text-[11px] flex items-center justify-center cursor-pointer transition touch-tactile"
                    title="แก้ไขรถ"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Action Buttons: จดไมล์ & เพิ่มข้อมูล */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button
            onClick={handleOpenMileage}
            className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#0B0D10] hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs touch-tactile"
          >
            <Gauge className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>จดไมล์</span>
          </button>
          <button
            onClick={handleOpenQuickAdd}
            className="py-2 px-3 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-xs font-semibold shadow-md shadow-[#1677FF]/25 flex items-center justify-center gap-1.5 transition cursor-pointer touch-tactile"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>เพิ่มข้อมูล</span>
          </button>
        </div>
      </div>
    </header>
  );
};

