import React, { useState } from 'react';
import { MotorcycleProfile, BikeType, DriveType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { Settings, Save, Trash2, AlertTriangle, Car, Fuel, Bike, Camera, Image, Check } from 'lucide-react';

interface EditBikeModalProps {
  bike: MotorcycleProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: MotorcycleProfile) => void;
  onDeleteBike?: (bikeId: string) => void;
  canDelete?: boolean;
}

export const EditBikeModal: React.FC<EditBikeModalProps> = ({
  bike,
  isOpen,
  onClose,
  onSave,
  onDeleteBike,
  canDelete = false,
}) => {
  const [formData, setFormData] = useState<MotorcycleProfile>(bike);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
        <div className="bg-[#15191E] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#1677FF]" />
              <h3 className="font-bold text-white text-base">แก้ไขข้อมูลรถมอเตอร์ไซค์</h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#A7ADB5] hover:text-white text-lg p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="pt-4 space-y-3.5 text-xs">
            {/* 1. Name & Brand/Model */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อรถที่จะแสดง *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ยี่ห้อ (Brand) *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">รุ่น (Model) *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 2. Year, Color & Plate */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ปีรถ (ค.ศ.) *</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">สีรถ</label>
                <input
                  type="text"
                  placeholder="เช่น แดง-ดำ"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">เลขทะเบียน *</label>
                <input
                  type="text"
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 3. Mileage & Engine CC & Fuel Type */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">เลขไมล์ปัจจุบัน (กม.) *</label>
                <input
                  type="number"
                  required
                  value={formData.currentMileage}
                  onChange={(e) => setFormData({ ...formData, currentMileage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono font-bold focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ขนาดเครื่องยนต์ (cc)</label>
                <input
                  type="number"
                  value={formData.engineCc || 125}
                  onChange={(e) => setFormData({ ...formData, engineCc: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ประเภทเชื้อเพลิง</label>
                <input
                  type="text"
                  placeholder="เช่น แก๊สโซฮอล์ 95"
                  value={formData.fuelType || 'แก๊สโซฮอล์ 95'}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 4. Drive type & Tank */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ระบบขับเคลื่อน</label>
                <select
                  value={formData.driveType}
                  onChange={(e) => setFormData({ ...formData, driveType: e.target.value as DriveType })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none cursor-pointer"
                >
                  <option value="chain">โซ่ขับสเตอร์</option>
                  <option value="belt">สายพาน (CVT)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ความจุถังน้ำมัน (ลิตร)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tankCapacityLiters}
                  onChange={(e) =>
                    setFormData({ ...formData, tankCapacityLiters: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 5. Oil Interval & Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  รอบเปลี่ยนน้ำมันเครื่อง (กม.)
                </label>
                <input
                  type="number"
                  value={formData.oilChangeIntervalKm}
                  onChange={(e) =>
                    setFormData({ ...formData, oilChangeIntervalKm: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">เกรดน้ำมันแนะนำ</label>
                <input
                  type="text"
                  value={formData.recommendedOilGrade}
                  onChange={(e) => setFormData({ ...formData, recommendedOilGrade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 6. Vehicle Photo (Requirement 32.6) */}
            <div className="p-4 rounded-2xl bg-[#0B0D10] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-white font-semibold text-xs">รูปรถมอเตอร์ไซค์</label>
                <span className="text-[11px] text-[#A7ADB5]">แสดงแบบรักษาสัดส่วน (contain)</span>
              </div>
              
              {/* [รูปปัจจุบัน] Current Photo Preview with object-contain */}
              <div className="w-full h-44 rounded-xl bg-[#15191E] border border-slate-800 p-2.5 flex items-center justify-center relative overflow-hidden">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#A7ADB5] space-y-1.5">
                    <Bike className="w-8 h-8 text-slate-600" />
                    <span className="text-xs">ยังไม่มีรูปรถ</span>
                    <span className="text-[10px] text-slate-500">กดปุ่มเปลี่ยนรูปเพื่ออัปโหลด</span>
                  </div>
                )}
              </div>

              {/* Photo Action Buttons: เปลี่ยนรูป / ลบรูป (Requirement 32.6) */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>เปลี่ยนรูป</span>
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
                        setFormData({ ...formData, photoUrl: res });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: undefined })}
                    className="px-3.5 py-2 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูป</span>
                  </button>
                )}
              </div>

              {/* Optional URL input */}
              <div>
                <input
                  type="text"
                  placeholder="หรือระบุ URL รูปภาพ เช่น https://..."
                  value={formData.photoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-slate-700 text-white text-xs focus:border-[#1677FF] outline-none"
                />
              </div>
            </div>

            {/* 7. Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">หมายเหตุเกี่ยวกับรถ</label>
              <textarea
                rows={2}
                placeholder="เช่น รถคันโปรด ซื้อมือสอง สภาพเดิมๆ"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {canDelete && onDeleteBike ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="px-3 py-2 rounded-xl text-[#EF4444] hover:text-white hover:bg-[#EF4444]/30 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบรถคันนี้</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex space-x-2">
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
                  บันทึกข้อมูลรถ
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 30.1: Confirmation Dialog for deleting a bike */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="ลบรถมอเตอร์ไซค์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรถคันนี้ (${bike.name})? ข้อมูลที่เกี่ยวข้องทั้งหมดของรถคันนี้จะถูกลบออก`}
        confirmLabel="ลบรถ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          if (onDeleteBike) onDeleteBike(bike.id);
          onClose();
        }}
      />
    </>
  );
};
