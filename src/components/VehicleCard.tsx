import React, { useState } from 'react';
import { MotorcycleProfile } from '../types';
import { Bike, Camera, Edit2, Gauge, CheckCircle2, ChevronRight, Fuel, Wrench } from 'lucide-react';
import { VehiclePhotoModal } from './VehiclePhotoModal';

interface VehicleCardProps {
  bike: MotorcycleProfile;
  isActive?: boolean;
  onSelectBike?: (bikeId: string) => void;
  onEditBike?: (bike: MotorcycleProfile) => void;
  onUpdateBikePhoto?: (bikeId: string, newPhotoUrl: string | undefined) => void;
  onOpenMileageModal?: () => void;
  onViewDetails?: (bike: MotorcycleProfile) => void;
  showDetailsButton?: boolean;
  isDashboardMain?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  bike,
  isActive = false,
  onSelectBike,
  onEditBike,
  onUpdateBikePhoto,
  onOpenMileageModal,
  onViewDetails,
  showDetailsButton = true,
  isDashboardMain = false,
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSavePhoto = (bikeId: string, newUrl: string | undefined) => {
    if (onUpdateBikePhoto) {
      onUpdateBikePhoto(bikeId, newUrl);
    }
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-[#15191E] border rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl transition-all duration-200 overflow-hidden relative group ${
          isActive
            ? 'border-[#1677FF] ring-1 ring-[#1677FF]/30 shadow-[#1677FF]/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80'
        }`}
      >
        {/* Top Active / Main badge */}
        {isActive && (
          <div className="absolute top-4 left-5 sm:left-6 flex items-center space-x-1.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] text-[11px] font-semibold border border-[#1677FF]/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#1677FF]" />
              <span>{isDashboardMain ? 'รถคันหลัก' : 'กำลังใช้งานอยู่'}</span>
            </span>
          </div>
        )}

        {/* 32. MAIN 2-PART HORIZONTAL LAYOUT */}
        <div className={`flex flex-row items-center justify-between gap-3 sm:gap-6 ${isActive ? 'pt-5' : ''}`}>
          
          {/* LEFT SIDE — VEHICLE INFO (55-65% width) */}
          <div className="flex-1 min-w-0 pr-1 sm:pr-2 flex flex-col justify-center space-y-1 sm:space-y-1.5">
            {/* 1. Brand (Honda) */}
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A7ADB5]">
              {bike.brand}
            </div>

            {/* 2. Model Name (MSX 125) — Largest and most prominent */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
              {bike.model || bike.name}
            </h3>

            {/* 3. Year & Mileage (2017 • 12,540 km) */}
            <div className="text-xs sm:text-sm text-slate-500 dark:text-[#A7ADB5] font-medium flex items-center space-x-2 font-mono pt-0.5">
              <span>ปี {bike.year}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-900 dark:text-white font-bold">{bike.currentMileage.toLocaleString()} km</span>
            </div>

            {/* 4. License Plate (ทะเบียน XXX-XXXX) */}
            <div className="text-xs sm:text-sm text-slate-500 dark:text-[#A7ADB5] font-mono flex items-center space-x-1.5 pt-0.5">
              <span className="text-slate-400 dark:text-slate-500">ทะเบียน</span>
              <span className="text-slate-800 dark:text-white font-semibold tracking-wide">{bike.plateNumber}</span>
            </div>

            {/* Badges / Extras */}
            <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] sm:text-[11px]">
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0D10] text-slate-700 dark:text-[#A7ADB5] border border-slate-200 dark:border-slate-800">
                {bike.driveType === 'chain' ? '⛓️ โซ่สเตอร์' : '🔄 สายพาน CVT'}
              </span>
              {bike.engineCc && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0D10] text-slate-700 dark:text-[#A7ADB5] border border-slate-200 dark:border-slate-800">
                  {bike.engineCc} cc
                </span>
              )}
              {bike.color && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0D10] text-slate-700 dark:text-[#A7ADB5] border border-slate-200 dark:border-slate-800 hidden sm:inline">
                  {bike.color}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — VEHICLE PHOTO (35-45% width, centered vertically, object-contain) */}
          <div className="w-[38%] sm:w-[42%] max-w-[260px] shrink-0 flex items-center justify-center relative my-auto">
            {bike.photoUrl ? (
              <div
                onClick={() => setIsPhotoModalOpen(true)}
                className="relative w-full h-32 sm:h-40 md:h-44 flex items-center justify-center cursor-pointer group/photo rounded-2xl overflow-hidden p-1 hover:bg-[#0B0D10]/60 transition"
                title="คลิกเพื่อเปลี่ยนหรือจัดการรูปรถ"
              >
                <img
                  src={bike.photoUrl}
                  alt={bike.name}
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover/photo:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-2xl gap-1.5 text-white text-xs font-semibold backdrop-blur-xs">
                  <Camera className="w-4 h-4 text-[#1677FF]" />
                  <span>เปลี่ยนรูป</span>
                </div>
              </div>
            ) : (
              /* 32.3 Placeholder */
              <div
                onClick={() => setIsPhotoModalOpen(true)}
                className="w-full h-28 sm:h-36 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-[#1677FF] bg-[#0B0D10]/70 hover:bg-[#0B0D10] flex flex-col items-center justify-center p-2.5 text-center transition cursor-pointer group/placeholder"
                title="คลิกเพื่อถ่ายรูปหรือเลือกรูปรถ"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-800 group-hover/placeholder:bg-[#1677FF]/20 text-[#A7ADB5] group-hover/placeholder:text-[#1677FF] flex items-center justify-center mb-1.5 transition">
                  <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-200 group-hover/placeholder:text-white">
                  เพิ่มรูปรถ
                </span>
                <span className="text-[10px] text-[#A7ADB5] mt-0.5">
                  📷 ถ่ายรูป • 🖼️ Gallery
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR (34.6: Icon-only buttons with tooltips) */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {!isActive && onSelectBike && (
              <button
                type="button"
                onClick={() => onSelectBike(bike.id)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-[#1677FF]/15 text-slate-600 dark:text-[#A7ADB5] hover:text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
                title="สลับใช้รถคันนี้"
                aria-label="สลับใช้รถคันนี้"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}

            {onEditBike && (
              <button
                type="button"
                onClick={() => onEditBike(bike)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
                title="แก้ไขข้อมูลรถ"
                aria-label="แก้ไขข้อมูลรถ"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}

            {onOpenMileageModal && (
              <button
                type="button"
                onClick={onOpenMileageModal}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#22C55E] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
                title="จดเลขไมล์ด่วน"
                aria-label="จดเลขไมล์ด่วน"
              >
                <Gauge className="w-5 h-5" />
              </button>
            )}
          </div>

          {showDetailsButton && onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(bike)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-center ml-auto shrink-0"
              title="ดูรายละเอียดรถ"
              aria-label="ดูรายละเอียดรถ"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 32.1 PHOTO MANAGEMENT MODAL */}
      <VehiclePhotoModal
        isOpen={isPhotoModalOpen}
        bike={bike}
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={handleSavePhoto}
      />
    </>
  );
};
