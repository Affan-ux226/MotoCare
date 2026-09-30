import React, { useState } from 'react';
import { MotorcycleProfile, BikeType, DriveType } from '../types';
import { MOTORCYCLE_PRESETS, MOTORCYCLE_BRANDS, MotorcyclePreset } from '../data/motorcyclePresets';
import { Bike, Plus, Sparkles, Check, Car, Camera, Image, Trash2 } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newBike: MotorcycleProfile) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('Honda');
  const [selectedPreset, setSelectedPreset] = useState<MotorcyclePreset | null>(MOTORCYCLE_PRESETS[0]);

  // Form fields
  const [name, setName] = useState(MOTORCYCLE_PRESETS[0].fullName);
  const [brand, setBrand] = useState(MOTORCYCLE_PRESETS[0].brand);
  const [model, setModel] = useState(MOTORCYCLE_PRESETS[0].model);
  const [year, setYear] = useState<number>(2023);
  const [plateNumber, setPlateNumber] = useState('1กข 1234 กทม.');
  const [currentMileage, setCurrentMileage] = useState<number>(10000);
  const [bikeType, setBikeType] = useState<BikeType>(MOTORCYCLE_PRESETS[0].bikeType);
  const [driveType, setDriveType] = useState<DriveType>(MOTORCYCLE_PRESETS[0].driveType);
  const [tankCapacityLiters, setTankCapacityLiters] = useState<number>(MOTORCYCLE_PRESETS[0].tankCapacityLiters);
  const [oilChangeIntervalKm, setOilChangeIntervalKm] = useState<number>(MOTORCYCLE_PRESETS[0].oilChangeIntervalKm);
  const [recommendedOilGrade, setRecommendedOilGrade] = useState<string>(MOTORCYCLE_PRESETS[0].recommendedOilGrade);
  const [dailyAverageKm, setDailyAverageKm] = useState<number>(MOTORCYCLE_PRESETS[0].defaultDailyKm);
  const [photoUrl, setPhotoUrl] = useState<string>(MOTORCYCLE_PRESETS[0].photoUrl);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: MotorcyclePreset) => {
    setSelectedPreset(preset);
    setName(preset.fullName);
    setBrand(preset.brand);
    setModel(preset.model);
    setBikeType(preset.bikeType);
    setDriveType(preset.driveType);
    setTankCapacityLiters(preset.tankCapacityLiters);
    setOilChangeIntervalKm(preset.oilChangeIntervalKm);
    setRecommendedOilGrade(preset.recommendedOilGrade);
    setDailyAverageKm(preset.defaultDailyKm);
    setPhotoUrl(preset.photoUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBike: MotorcycleProfile = {
      id: `bike-${Date.now()}`,
      name,
      brand,
      model,
      year: Number(year) || 2023,
      plateNumber,
      currentMileage: Number(currentMileage) || 0,
      bikeType,
      driveType,
      tankCapacityLiters: Number(tankCapacityLiters) || 5.5,
      oilChangeIntervalKm: Number(oilChangeIntervalKm) || 3000,
      recommendedOilGrade,
      dailyAverageKm: Number(dailyAverageKm) || 25,
      lastOilChangeMileage: Math.max(0, Number(currentMileage) - 1000),
      lastOilChangeDate: new Date().toISOString().split('T')[0],
      photoUrl,
    };

    onAddVehicle(newBike);
    onClose();
  };

  const brandPresets = MOTORCYCLE_PRESETS.filter((p) => p.brand === selectedBrand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">เพิ่มรถมอเตอร์ไซค์คันใหม่</h3>
            <p className="text-xs text-slate-400">เลือกรุ่นยอดนิยม หรือระบุข้อมูลเองได้อิสระ</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Brand Selector Chips */}
        <div className="py-3 border-b border-slate-800 space-y-2">
          <label className="text-xs text-slate-400 font-semibold block">เลือกยี่ห้อ (Brand)</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MOTORCYCLE_BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setSelectedBrand(b);
                  const firstMatch = MOTORCYCLE_PRESETS.find((p) => p.brand === b);
                  if (firstMatch) handleSelectPreset(firstMatch);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedBrand === b
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Model Presets in selected brand */}
          {brandPresets.length > 0 && (
            <div className="pt-2">
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                รุ่นยอดนิยมในไทย:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {brandPresets.map((preset) => {
                  const isSelected = selectedPreset?.model === preset.model;
                  return (
                    <button
                      key={preset.model}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold truncate">{preset.fullName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Form */}
        <form onSubmit={handleSubmit} className="pt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อรถที่จะแสดง *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ทะเบียนรถ *</label>
              <input
                type="text"
                required
                placeholder="เช่น 1กข 7890 กทม."
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ปีที่ผลิต (ค.ศ.)</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">เลขไมล์ปัจจุบัน (กม.) *</label>
              <input
                type="number"
                required
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ระบบขับเคลื่อน</label>
              <select
                value={driveType}
                onChange={(e) => setDriveType(e.target.value as DriveType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="chain">โซ่ขับสเตอร์</option>
                <option value="belt">สายพาน (CVT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                รอบเปลี่ยนน้ำมันเครื่อง (กม.)
              </label>
              <input
                type="number"
                value={oilChangeIntervalKm}
                onChange={(e) => setOilChangeIntervalKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ความจุถังน้ำมัน (ลิตร)</label>
              <input
                type="number"
                step="0.1"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              เกรดน้ำมันเครื่องที่แนะนำ
            </label>
            <input
              type="text"
              value={recommendedOilGrade}
              onChange={(e) => setRecommendedOilGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Photo container with contain fit */}
          <div className="p-3.5 rounded-2xl bg-[#0B0D10] border border-slate-800 space-y-2.5">
            <label className="block text-slate-300 font-semibold text-xs">รูปรถมอเตอร์ไซค์</label>
            <div className="w-full h-36 rounded-xl bg-[#15191E] border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <Bike className="w-8 h-8 text-slate-600" />
                  <span className="text-[11px]">ยังไม่มีรูปรถ</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition">
                <Camera className="w-3.5 h-3.5" />
                <span>ถ่ายรูป / เลือกภาพ</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const res = ev.target?.result as string;
                      setPhotoUrl(res);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="px-3 py-1.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบรูป</span>
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="หรือระบุ URL รูปภาพ (https://...)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#A7ADB5] hover:text-white text-xs cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              เพิ่มรถมอเตอร์ไซค์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
