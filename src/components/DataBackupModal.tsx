import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Database, Download, Upload, RotateCcw, User, Check, AlertTriangle } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => boolean;
  onResetData: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateUserProfile,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile({
      ...userProfile,
      name,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setImportStatus('นำเข้าข้อมูลสำเร็จแล้ว!');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } else {
        setImportStatus('ไฟล์ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบไฟล์');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">จัดการข้อมูล & โปรไฟล์</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* User Name Section */}
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            ชื่อของคุณ (แสดงบนหัวแอป “สวัสดี 👋”)
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <span>บันทึก</span>}
            </button>
          </div>
        </form>

        {/* Backup and Restore Section */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            สำรอง & กู้คืนข้อมูล (Backup & Restore)
          </label>
          <p className="text-[11px] text-slate-400">
            ข้อมูลทั้งหมดถูกบันทึกไว้ในเบราว์เซอร์ของคุณ คุณสามารถดาวน์โหลดเป็นไฟล์ JSON เพื่อสำรองเก็บไว้หรือย้ายไปเครื่องอื่นได้
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportData}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>ดาวน์โหลด JSON</span>
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-1.5 transition cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>นำเข้า JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs text-center">
              {importStatus}
            </div>
          )}
        </div>

        {/* Reset to Factory Demo Data */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            รีเซ็ตเป็นข้อมูลเริ่มต้น (Demo Factory Reset)
          </label>
          <p className="text-[11px] text-slate-400">
            รีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าตั้งต้น (Honda MSX 125 และ Honda Click 160)
          </p>

          <button
            onClick={() => {
              if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตัวอย่างใช่หรือไม่?')) {
                onResetData();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเซ็ตข้อมูลตัวอย่างทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
