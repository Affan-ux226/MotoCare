import React, { useState } from 'react';
import {
  MotorcycleProfile,
  MaintenanceItem,
  ExpenseRecord,
  FuelRecord,
  VehicleDocument,
  UserProfile,
} from '../types';
import {
  calculateOilStatus,
  calculateItemHealth,
  getSevenInstantAnswers,
  calculateDocumentStatus,
} from '../utils/calculations';
import {
  Bike,
  Gauge,
  Plus,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Fuel,
  Wrench,
  FileText,
  Calendar,
  ShieldAlert,
  HelpCircle,
  Edit2,
  Camera,
  DollarSign,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import { VehiclePhotoModal } from './VehiclePhotoModal';
import { PWAInstallButton } from './PWAInstallButton';
import { AnimatedCounter } from './AnimatedCounter';
import { CopyableBadge } from './CopyableBadge';
import { feedback } from '../utils/feedback';

interface DashboardOverviewProps {
  bike: MotorcycleProfile;
  bikes: MotorcycleProfile[];
  userProfile: UserProfile;
  maintenanceItems: MaintenanceItem[];
  expenses: ExpenseRecord[];
  fuelRecords: FuelRecord[];
  documents: VehicleDocument[];
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenMileageModal: () => void;
  onOpenQuickAddModal: (defaultType?: 'fuel' | 'oil' | 'service' | 'expense') => void;
  onOpenEditBikeModal: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectMaintenanceItem: (item: MaintenanceItem) => void;
  onAskAI: (prompt: string) => void;
  onUpdateBikeQuick: (updatedBike: MotorcycleProfile, changeDescription?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  bike,
  bikes = [],
  userProfile,
  maintenanceItems,
  expenses,
  fuelRecords,
  documents,
  isDarkMode,
  onToggleDarkMode,
  onOpenMileageModal,
  onOpenQuickAddModal,
  onOpenEditBikeModal,
  onNavigateTab,
  onSelectMaintenanceItem,
  onAskAI,
  onUpdateBikeQuick,
}) => {
  const oilStatus = calculateOilStatus(bike);
  const sevenAnswers = getSevenInstantAnswers(bike, expenses, fuelRecords, maintenanceItems);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Maintenance health items for current bike
  const bikeMaintenanceItems = maintenanceItems.filter((i) => i.bikeId === bike.id || !i.bikeId);
  const healthList = bikeMaintenanceItems.map((item) =>
    calculateItemHealth(item, bike.currentMileage, bike.dailyAverageKm)
  );
  const urgentItems = healthList.filter((h) => h.urgency !== 'normal');

  // Documents status
  const bikeDocs = documents.filter((d) => d.bikeId === bike.id || !d.bikeId);
  const docStatuses = bikeDocs.map((doc) => ({
    doc,
    ...calculateDocumentStatus(doc),
  }));
  const expiringDocs = docStatuses.filter((d) => d.status !== 'normal');

  // Quick stats calculations for current month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses.filter(
    (e) => (e.bikeId === bike.id || !e.bikeId) && e.date.startsWith(currentMonthStr)
  );
  const thisMonthTotalExpense = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthFuel = fuelRecords.filter(
    (f) => (f.bikeId === bike.id || !f.bikeId) && f.date.startsWith(currentMonthStr)
  );
  const thisMonthFuelCost = thisMonthFuel.reduce((sum, f) => sum + f.totalPrice, 0);
  const thisMonthFuelLiters = thisMonthFuel.reduce((sum, f) => sum + f.liters, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-8 animate-in fade-in duration-200">
      {/* 1. GREETING BANNER & AI QUICK ACTION (Full width on top) */}
      <div className="bg-gradient-to-r from-[#1677FF] to-[#0D5FD1] rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-[#1677FF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
              ยินดีต้อนรับ 👋
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              คุณ{userProfile.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-200 mt-1">
            พร้อมดูแลรถ{' '}
            <span className="font-semibold text-white underline decoration-amber-400 decoration-2 underline-offset-2">
              {bike.name}
            </span>{' '}
            ให้พร้อมลุยทุกเส้นทางอย่างมั่นใจ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 flex items-center justify-center transition cursor-pointer backdrop-blur-xs shadow-xs"
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              aria-label="เปลี่ยนธีม"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-100" />}
            </button>
          )}

          <button
            onClick={() =>
              onAskAI(`วิเคราะห์สภาพรถ ${bike.name} เลขไมล์ ${bike.currentMileage} กม. ให้หน่อยครับ`)
            }
            className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer backdrop-blur-xs shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ตรวจสภาพกับช่าง AI</span>
          </button>
        </div>
      </div>

      {/* OVERDUE ALERT BANNER (If any alerts exist) */}
      {(oilStatus.status === 'overdue' || urgentItems.length > 0 || expiringDocs.length > 0) && (
        <div className="p-4 rounded-3xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-300 dark:text-rose-200">
                มีรายการบำรุงรักษาหรือเอกสารที่ต้องดำเนินการทันที!
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                {oilStatus.status === 'overdue' &&
                  `• น้ำมันเครื่องเกินระยะแล้ว ${Math.abs(oilStatus.kmRemaining).toLocaleString()} กม. `}
                {urgentItems.filter((u) => u.urgency === 'overdue').length > 0 &&
                  `• ชิ้นส่วนเกินกำหนด ${
                    urgentItems.filter((u) => u.urgency === 'overdue').length
                  } รายการ `}
                {expiringDocs.length > 0 && `• เอกสารใกล้หมดอายุ/หมดอายุแล้ว ${expiringDocs.length} ฉบับ`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onOpenQuickAddModal('oil')}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              บันทึกถ่ายน้ำมัน
            </button>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              ดูรายการทั้งหมด
            </button>
          </div>
        </div>
      )}

      {/* 2. OMNICHANNEL ADAPTIVE GRID (2:1 Column Ratio on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT / MAIN COLUMN (lg:col-span-2) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* VEHICLE HERO CARD */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-5 sm:p-7 relative group">
            {/* Top Control Bar with Badges & Actions */}
            <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-[#1677FF]/15 text-[#1677FF] text-xs font-semibold border border-[#1677FF]/30">
                  รถคันหลัก
                </span>
                <span className="text-xs text-slate-500 dark:text-[#A7ADB5] hidden sm:inline font-mono">
                  {bike.driveType === 'chain' ? '⛓️ โซ่สเตอร์' : '🔄 สายพาน CVT'} • ถัง {bike.tankCapacityLiters} ลิตร
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigateTab('garage')}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-[#1677FF]/15 active:scale-95 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
                  title={`โรงรถของฉัน (${bikes.length} คัน)`}
                  aria-label={`โรงรถของฉัน (${bikes.length} คัน)`}
                >
                  <Bike className="w-5 h-5" />
                </button>
                <button
                  onClick={onOpenEditBikeModal}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
                  title="แก้ไขข้อมูลรถ"
                  aria-label="แก้ไขข้อมูลรถ"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* HORIZONTAL 2-PART LAYOUT: LEFT INFO / RIGHT PHOTO */}
            <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 min-h-[160px] sm:min-h-[180px]">
              {/* LEFT SIDE — VEHICLE INFO */}
              <div className="flex-1 min-w-0 pr-1 sm:pr-3 flex flex-col justify-center space-y-1 sm:space-y-1.5">
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-[#A7ADB5]">
                  {bike.brand}
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-[#FFFFFF] tracking-tight truncate leading-tight">
                    {bike.model || bike.name}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-500 dark:text-[#A7ADB5] font-medium flex items-center space-x-2 font-mono pt-0.5">
                  <span>ปี {bike.year}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    <AnimatedCounter value={bike.currentMileage} suffix=" km" />
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-500 dark:text-[#A7ADB5] font-mono flex items-center space-x-1.5 pt-0.5">
                  <span className="text-slate-400">ทะเบียน</span>
                  <CopyableBadge
                    textToCopy={bike.plateNumber}
                    label={<span className="text-slate-800 dark:text-white font-semibold tracking-wide hover:text-[#1677FF]">{bike.plateNumber}</span>}
                    title="คลิกเพื่อคัดลอกเลขทะเบียน"
                  />
                </div>

                <div className="pt-1.5 flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-[#A7ADB5]">
                  {bike.color && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                      🎨 {bike.color}
                    </span>
                  )}
                  {bike.engineCc && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                      {bike.engineCc} cc
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE — VEHICLE PHOTO */}
              <div className="w-[38%] sm:w-[42%] max-w-[280px] shrink-0 flex items-center justify-center relative my-auto">
                {bike.photoUrl ? (
                  <div
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="relative w-full h-32 sm:h-40 md:h-44 flex items-center justify-center cursor-pointer group/photo rounded-2xl overflow-hidden p-1 hover:bg-slate-100 dark:hover:bg-[#0B0D10]/60 transition"
                    title="คลิกเพื่อถ่ายรูปใหม่ หรือเปลี่ยนรูปรถ"
                  >
                    <img
                      src={bike.photoUrl}
                      alt={bike.name}
                      className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover/photo:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-2xl gap-1.5 text-white text-xs font-semibold backdrop-blur-xs">
                      <Camera className="w-4 h-4 text-[#1677FF]" />
                      <span>เปลี่ยนรูป</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="w-full h-28 sm:h-38 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-[#1677FF] bg-slate-50 dark:bg-[#0B0D10]/70 hover:bg-slate-100 dark:hover:bg-[#0B0D10] flex flex-col items-center justify-center p-2.5 text-center transition cursor-pointer group/placeholder"
                    title="คลิกเพื่อถ่ายรูปหรือเลือกรูปรถ"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 group-hover/placeholder:bg-[#1677FF]/20 text-slate-500 dark:text-[#A7ADB5] group-hover/placeholder:text-[#1677FF] flex items-center justify-center mb-1.5 transition">
                      <Bike className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover/placeholder:text-white">
                      เพิ่มรูปรถ
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#A7ADB5] mt-0.5">
                      📷 ถ่ายรูป • 🖼️ Gallery
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Odometer Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="bg-slate-50 dark:bg-[#0B0D10] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30 shrink-0">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-[#A7ADB5] block">
                      ระยะทางสะสมบนหน้าปัด (Odometer)
                    </span>
                    <div className="flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        <AnimatedCounter value={bike.currentMileage} />
                      </span>
                      <span className="text-xs font-semibold text-[#1677FF]">km</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <span className="text-xs text-slate-500 dark:text-[#A7ADB5] font-mono mr-2 hidden md:inline">
                    วิ่งเฉลี่ย ~{bike.dailyAverageKm} กม./วัน
                  </span>
                  <button
                    onClick={() => {
                      feedback('odometer');
                      onOpenMileageModal();
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white dark:bg-[#15191E] hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 text-[#1677FF] border border-slate-200 dark:border-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 touch-tactile"
                    title="จดไมล์"
                    aria-label="จดไมล์"
                  >
                    <Gauge className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                  <button
                    onClick={() => {
                      feedback('click');
                      onOpenQuickAddModal();
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-90 text-white shadow-md shadow-[#1677FF]/30 flex items-center justify-center transition cursor-pointer shrink-0 touch-tactile"
                    title="เพิ่มข้อมูล (＋)"
                    aria-label="เพิ่มข้อมูล"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ENGINE OIL STATUS CARD */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-[#1677FF] flex items-center justify-center border border-blue-500/30">
                  <Droplet className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      น้ำมันเครื่อง (Engine Oil Status)
                    </h3>
                    {oilStatus.status === 'overdue' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/40">
                        🔴 ถึงกำหนดแล้ว
                      </span>
                    ) : oilStatus.status === 'warning' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/40">
                        🟡 ใกล้ถึงกำหนด
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold border border-emerald-500/40">
                        🟢 ปกติ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    เกรดแนะนำ: <span className="font-mono text-slate-800 dark:text-slate-200">{bike.recommendedOilGrade}</span> • รอบถ่ายทุก{' '}
                    {bike.oilChangeIntervalKm.toLocaleString()} กม.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenQuickAddModal('oil')}
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-xs font-bold shadow-md shadow-[#1677FF]/30 transition cursor-pointer"
                >
                  บันทึกถ่ายน้ำมันเครื่อง
                </button>
                <button
                  onClick={() =>
                    onAskAI(
                      `แนะนำน้ำมันเครื่องสำหรับรถ ${bike.name} ปี ${bike.year} วิ่งมาแล้ว ${bike.currentMileage} กม. ใช้เกรดไหนและสังเคราะห์แท้ตัวไหนดีที่สุด?`
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 active:scale-95 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="ถามช่าง AI เกี่ยวกับน้ำมันเครื่องรุ่นนี้"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Progress Bar & Stats */}
            <div className="pt-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">วิ่งมาแล้วหลังเปลี่ยน</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                    {oilStatus.kmDrivenSinceLastChange.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">กม.</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">คงเหลือที่วิ่งได้</span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      oilStatus.kmRemaining <= 0
                        ? 'text-rose-500'
                        : oilStatus.kmRemaining <= 500
                        ? 'text-amber-500'
                        : 'text-[#1677FF]'
                    }`}
                  >
                    {oilStatus.kmRemaining > 0
                      ? oilStatus.kmRemaining.toLocaleString()
                      : `เลย ${Math.abs(oilStatus.kmRemaining).toLocaleString()}`}{' '}
                    <span className="text-xs font-normal text-slate-400">กม.</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">คาดการณ์วันที่ต้องเปลี่ยน</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {oilStatus.predictedDueDate}
                  </span>
                  <span className="text-[10px] text-slate-400">~{oilStatus.daysRemaining} วัน</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">รอบถ่ายถัดไปที่เลขไมล์</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                    {oilStatus.nextDueMileage.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">กม.</span>
                  </span>
                </div>
              </div>

              {/* Linear Progress with animated shine microinteraction */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                  <span>ความสึกหรอน้ำมัน: {oilStatus.percentUsed}%</span>
                  <span>{oilStatus.statusText}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 relative group">
                  <div
                    className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                      oilStatus.status === 'overdue'
                        ? 'bg-rose-500'
                        : oilStatus.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-[#1677FF]'
                    }`}
                    style={{ width: `${Math.min(oilStatus.percentUsed, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-micro-shine w-1/2 h-full pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7 KEY INSTANT ANSWERS */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#1677FF] flex items-center justify-center border border-blue-500/20">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    สรุปข้อมูลสำคัญในพริบตา (7 คำตอบทันที)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ภาพรวมสุขภาพรถ ค่าใช้จ่าย และสิ่งที่ต้องรู้เมื่อเปิดแอป
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Realtime
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">1. รถของฉันคืออะไร?</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {sevenAnswers.answer1}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">2. รถวิ่งมาแล้วกี่กิโลเมตร?</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {sevenAnswers.answer2}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">3. ถึงเวลาบำรุงรักษาหรือยัง?</span>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      sevenAnswers.overdueCount > 0
                        ? 'text-rose-500'
                        : sevenAnswers.dueSoonCount > 0
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {sevenAnswers.answer3}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">4. เดือนนี้เสียค่ารถไปเท่าไร?</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {sevenAnswers.answer4}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">5. เติมน้ำมันไปเท่าไร?</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {sevenAnswers.answer5}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  6
                </span>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">6. มีรายการซ่อมอะไรล่าสุด?</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                    {sevenAnswers.answer6}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-start space-x-3 md:col-span-2">
                <span className="w-6 h-6 rounded-lg bg-[#1677FF]/20 text-[#1677FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  7
                </span>
                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">7. รายการไหนกำลังจะถึงกำหนด?</span>
                    <p className="text-sm font-bold text-amber-500 mt-0.5">
                      {sevenAnswers.answer7}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('maintenance')}
                    className="text-xs text-[#1677FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>ตรวจเช็คทั้ง 9 รายการ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAINTENANCE 9 ITEMS PREVIEW */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#1677FF]" />
                  <span>สถานะการบำรุงรักษาชิ้นส่วน (Maintenance Status)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ตรวจเช็ค 9 รายการหลัก: น้ำมันเครื่อง, ผ้าเบรก, ยาง, น้ำมันเบรก, น้ำหล่อเย็น, โซ่/สายพาน, แบตเตอรี่, หัวเทียน, กรองอากาศ
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('maintenance')}
                className="text-xs font-semibold text-[#1677FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
              {healthList.slice(0, 6).map((health) => {
                const isOverdue = health.urgency === 'overdue';
                const isDueSoon = health.urgency === 'due_soon';
                return (
                  <div
                    key={health.item.id}
                    onClick={() => onSelectMaintenanceItem(health.item)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 hover:border-[#1677FF]/40 active:scale-98 transition cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1677FF] transition">
                        {health.item.thaiName}
                      </span>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[11px] font-bold border border-rose-500/30 flex items-center gap-1">
                          🔴 ถึงกำหนด
                        </span>
                      ) : isDueSoon ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
                          🟡 ใกล้ถึง
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                          🟢 ปกติ
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>ระยะคงเหลือ:</span>
                        <strong
                          className={
                            isOverdue
                              ? 'text-rose-500 font-mono'
                              : isDueSoon
                              ? 'text-amber-500 font-mono'
                              : 'text-slate-700 dark:text-slate-200 font-mono'
                          }
                        >
                          {health.kmRemaining > 0
                            ? `เหลือ ${health.kmRemaining.toLocaleString()} km`
                            : `เลย ${Math.abs(health.kmRemaining).toLocaleString()} km`}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>รอบเปลี่ยน: {health.item.intervalKm.toLocaleString()} km</span>
                        <span className="text-[#1677FF] font-semibold group-hover:underline">
                          [ดู]
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${health.percentWear}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT / SIDEBAR COLUMN (lg:col-span-1) ================= */}
        <div className="lg:col-span-1 space-y-6">
          {/* QUICK ACTIONS PANEL (Technique 2 & 3: Touch & Mouse optimized) */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1677FF]" />
                <span>การกระทำด่วน (Quick Actions)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenMileageModal}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex flex-col justify-between min-h-[76px] cursor-pointer group"
              >
                <Gauge className="w-5 h-5 text-[#1677FF] group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">จดบันทึกไมล์</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">อัปเดตหน้าปัด</p>
                </div>
              </button>

              <button
                onClick={() => onOpenQuickAddModal('fuel')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex flex-col justify-between min-h-[76px] cursor-pointer group"
              >
                <Fuel className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">เติมน้ำมัน</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">บันทึกลิตร/บาท</p>
                </div>
              </button>

              <button
                onClick={() => onOpenQuickAddModal('oil')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex flex-col justify-between min-h-[76px] cursor-pointer group"
              >
                <Droplet className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">ถ่ายน้ำมันเครื่อง</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">รีเซ็ตระยะรอบถ่าย</p>
                </div>
              </button>

              <button
                onClick={() => onOpenQuickAddModal('expense')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex flex-col justify-between min-h-[76px] cursor-pointer group"
              >
                <DollarSign className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">ลงค่าใช้จ่าย</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">ซ่อม / แต่ง / ยาง</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => onAskAI(`ช่วยวิเคราะห์อาการรถ ${bike.name} มีเสียงดังตรงสายพาน/โซ่ เกิดจากอะไรได้บ้าง?`)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 active:scale-95 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">ถามช่าง AI ปัญหารถคันนี้</span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* MONTHLY SUMMARY CARD */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>สรุปค่าใช้จ่ายเดือนนี้</span>
              </span>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="text-[11px] text-[#1677FF] hover:underline font-semibold"
              >
                ดูกราฟ
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">ค่าน้ำมัน</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">
                      {thisMonthFuelLiters.toFixed(1)} ลิตร
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  ฿{thisMonthFuelCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">ค่าซ่อม & บำรุงรักษา</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">
                      {thisMonthExpenses.length} รายการ
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  ฿{thisMonthTotalExpense.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* DOCUMENTS & TAX STATUS WIDGET */}
          <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>ภาษี & พ.ร.บ.</span>
              </span>
              <button
                onClick={() => onNavigateTab('documents')}
                className="text-[11px] text-[#1677FF] hover:underline font-semibold"
              >
                จัดการ
              </button>
            </div>

            <div className="space-y-2">
              {docStatuses.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  <p>ยังไม่มีเอกสาร</p>
                  <button
                    onClick={() => onNavigateTab('documents')}
                    className="mt-2 text-xs font-semibold text-[#1677FF] underline"
                  >
                    + เพิ่ม พ.ร.บ./ภาษี
                  </button>
                </div>
              ) : (
                docStatuses.slice(0, 3).map(({ doc, status, daysRemaining, statusText }) => (
                  <div
                    key={doc.id}
                    onClick={() => onNavigateTab('documents')}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">
                        หมดอายุ: {doc.expiryDate}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        status === 'expired'
                          ? 'bg-rose-500/20 text-rose-500'
                          : status === 'due_soon'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PWA INSTALL PROMO CARD (Technique 4) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1677FF]/10 via-[#0D5FD1]/5 to-transparent border border-[#1677FF]/25 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1677FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1677FF]/30">
                <Download className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  ติดตั้ง MotoCare ลงเครื่อง
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-[#A7ADB5]">
                  ใช้งานออฟไลน์ เปิดเร็ว ไม่เปลืองเน็ต
                </p>
              </div>
            </div>
            <PWAInstallButton variant="full" />
          </div>
        </div>
      </div>

      {/* 32.1 PHOTO MANAGER MODAL FOR DASHBOARD VEHICLE */}
      <VehiclePhotoModal
        isOpen={isPhotoModalOpen}
        bike={bike}
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={(bikeId, newPhotoUrl) => {
          onUpdateBikeQuick({ ...bike, photoUrl: newPhotoUrl }, 'อัปเดตรูปรถ');
        }}
      />
    </div>
  );
};
