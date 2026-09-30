import React, { useState } from 'react';
import { MotorcycleProfile, MaintenanceItem, ExpenseRecord } from '../types';
import { VehicleCard } from './VehicleCard';
import { Bike, Plus, Sparkles, Wrench, Fuel, BarChart3, ChevronRight, CheckCircle2, Cloud } from 'lucide-react';

interface GarageViewProps {
  bikes: MotorcycleProfile[];
  activeBikeId: string;
  onSelectBike: (bikeId: string) => void;
  onOpenAddBikeModal: () => void;
  onOpenEditBikeModal: (bike: MotorcycleProfile) => void;
  onUpdateBikePhoto: (bikeId: string, newPhotoUrl: string | undefined) => void;
  onOpenMileageModal: () => void;
  onNavigateTab: (tab: string) => void;
  onCloudSync?: () => void;
  onDeleteBike?: (bikeId: string) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  bikes,
  activeBikeId,
  onSelectBike,
  onOpenAddBikeModal,
  onOpenEditBikeModal,
  onUpdateBikePhoto,
  onOpenMileageModal,
  onNavigateTab,
  onCloudSync,
  onDeleteBike,
}) => {
  const [selectedDetailBike, setSelectedDetailBike] = useState<MotorcycleProfile | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] flex items-center justify-center text-white shadow-lg shadow-[#1677FF]/30 border border-white/10 shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                โรงรถของฉัน (Garage)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] font-semibold border border-[#1677FF]/30">
                {bikes.length} คัน
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#A7ADB5] mt-1">
              จัดการรายการรถมอเตอร์ไซค์ทั้งหมดในบัญชี สลับรถใช้งาน หรือกดที่รูปเพื่อถ่าย/เปลี่ยนรูป
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
          {onCloudSync && (
            <button
              onClick={onCloudSync}
              className="h-11 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title="ซิงค์ข้อมูลขึ้นคลาวด์"
            >
              <Cloud className="w-4 h-4 text-[#1677FF]" />
              <span className="hidden sm:inline">ซิงค์คลาวด์</span>
            </button>
          )}

          <button
            onClick={onOpenAddBikeModal}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white flex items-center justify-center shadow-md shadow-[#1677FF]/25 transition cursor-pointer shrink-0"
            title="เพิ่มรถคันใหม่ (＋)"
            aria-label="เพิ่มรถคันใหม่"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 32.4 VERTICAL LIST OF VEHICLE CARDS */}
      <div className="space-y-4">
        {bikes.map((bike) => {
          const isCurrentActive = bike.id === activeBikeId;
          return (
            <VehicleCard
              key={bike.id}
              bike={bike}
              isActive={isCurrentActive}
              isDashboardMain={isCurrentActive}
              onSelectBike={(id) => onSelectBike(id)}
              onEditBike={() => onOpenEditBikeModal(bike)}
              onUpdateBikePhoto={onUpdateBikePhoto}
              onOpenMileageModal={onOpenMileageModal}
              onViewDetails={() => {
                onSelectBike(bike.id);
                onNavigateTab('overview');
              }}
              showDetailsButton={true}
            />
          );
        })}
      </div>

      {/* Empty State if no bikes */}
      {bikes.length === 0 && (
        <div className="bg-[#15191E] border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Bike className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">ยังไม่มีรถในโรงรถ</h3>
            <p className="text-xs text-[#A7ADB5]">เริ่มเพิ่มรถมอเตอร์ไซค์คันแรกของคุณเพื่อเริ่มต้นใช้งาน MotoCare</p>
          </div>
          <button
            onClick={onOpenAddBikeModal}
            className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            + เพิ่มรถมอเตอร์ไซค์คันแรก
          </button>
        </div>
      )}
    </div>
  );
};
