import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, Globe, DollarSign, Gauge, Image, Check } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [nickname, setNickname] = useState(userProfile.nickname || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '081-234-5678');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [language, setLanguage] = useState<'th' | 'en'>(userProfile.language || 'th');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>(userProfile.distanceUnit || 'km');
  const [currency, setCurrency] = useState<'THB' | 'USD'>(userProfile.currency || 'THB');
  const [preferredGasStation, setPreferredGasStation] = useState(userProfile.preferredGasStation || 'ปตท. (PTT Station)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      nickname,
      email,
      phoneNumber,
      avatarUrl,
      language,
      distanceUnit,
      currency,
      preferredGasStation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">แก้ไขข้อมูลโปรไฟล์</h3>
              <p className="text-xs text-slate-400">ตั้งค่าบัญชี หน่วยวัด ภาษา และข้อมูลติดต่อ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ชื่อผู้ใช้งาน *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">อีเมล (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">URL รูปโปรไฟล์</label>
            <input
              type="text"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ภาษา</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'th' | 'en')}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="th">ไทย (TH)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">หน่วยระยะทาง</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="km">กิโลเมตร (km)</option>
                <option value="mi">ไมล์ (mi)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">สกุลเงิน</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'THB' | 'USD')}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="THB">บาท (฿)</option>
                <option value="USD">ดอลลาร์ ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ปั๊มน้ำมันประจำ</label>
            <input
              type="text"
              value={preferredGasStation}
              onChange={(e) => setPreferredGasStation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
