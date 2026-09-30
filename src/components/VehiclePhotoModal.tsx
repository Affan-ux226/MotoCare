import React, { useState, useRef } from 'react';
import { Camera, Image, Trash2, Check, X, RefreshCw, Bike, Upload } from 'lucide-react';
import { MotorcycleProfile } from '../types';

interface VehiclePhotoModalProps {
  isOpen: boolean;
  bike: MotorcycleProfile;
  onClose: () => void;
  onSavePhoto: (bikeId: string, newPhotoUrl: string | undefined) => void;
}

export const VehiclePhotoModal: React.FC<VehiclePhotoModalProps> = ({
  isOpen,
  bike,
  onClose,
  onSavePhoto,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(bike.photoUrl);
  const [hasPendingChange, setHasPendingChange] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUrlInputOpen, setIsUrlInputOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file selection (Camera or Gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setHasPendingChange(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setHasPendingChange(true);
    setIsUrlInputOpen(false);
  };

  // Handle Delete / Remove Photo
  const handleRemovePhoto = () => {
    setPreviewUrl(undefined);
    setHasPendingChange(true);
  };

  // Confirm Save
  const handleConfirmSave = () => {
    onSavePhoto(bike.id, previewUrl);
    setHasPendingChange(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#15191E] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">จัดการรูปรถมอเตอร์ไซค์</h3>
              <p className="text-xs text-[#A7ADB5]">{bike.name} ({bike.plateNumber})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A7ADB5] hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 32.1 & 32.2 Photo Preview Container */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {hasPendingChange ? 'รูปตัวอย่างก่อนบันทึก (Preview)' : 'รูปรถปัจจุบัน'}
          </label>
          <div className="w-full h-52 sm:h-56 rounded-2xl bg-[#0B0D10] border border-slate-800 p-3 flex items-center justify-center relative overflow-hidden group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={bike.name}
                className="w-full h-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-[#A7ADB5] space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <Bike className="w-8 h-8" />
                </div>
                <span className="text-xs">ยังไม่มีรูปรถ</span>
                <span className="text-[11px] text-slate-500">กดปุ่มด้านล่างเพื่อถ่ายรูปหรือเลือกจากคลังภาพ</span>
              </div>
            )}

            {hasPendingChange && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#1677FF] text-white text-[10px] font-bold shadow-md animate-pulse">
                รอการบันทึก
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Camera / Gallery / Remove (Requirement 32.1 & 32.3) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-[#0B0D10] hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#1677FF]" />
            <span>📷 ถ่ายรูปใหม่</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-[#0B0D10] hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Image className="w-4 h-4 text-[#22C55E]" />
            <span>🖼️ เลือกจาก Gallery</span>
          </button>
        </div>

        {/* Secondary Actions: URL Input & Remove */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
            className="text-[#1677FF] hover:underline font-medium cursor-pointer"
          >
            {isUrlInputOpen ? 'ซ่อนช่องใส่ URL' : '🔗 ใส่ลิงก์ URL รูปภาพ'}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-[#EF4444] hover:text-red-400 flex items-center space-x-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบรูป</span>
            </button>
          )}
        </div>

        {/* Expandable URL Input Field */}
        {isUrlInputOpen && (
          <div className="flex gap-2 animate-in fade-in duration-100">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-xs focus:border-[#1677FF] outline-none"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-semibold cursor-pointer"
            >
              นำไปใช้
            </button>
          </div>
        )}

        {/* Footer: Cancel / Save */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#A7ADB5] hover:text-white text-xs cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกรูปรถ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
