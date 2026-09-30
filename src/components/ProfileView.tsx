import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Settings,
  LogOut,
  Trash2,
  Bike,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
  Moon,
  Sun,
  Database,
  Calendar,
  Smartphone,
  Info,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { UserProfile, MotorcycleProfile, ExpenseRecord, UserSession } from '../types';
import { changePassword, deleteUserAccount } from '../utils/authService';
import { PWAInstallButton } from './PWAInstallButton';
import { MicrointeractionSettingsCard } from './MicrointeractionSettingsCard';
import { feedback } from '../utils/feedback';

interface ProfileViewProps {
  session?: UserSession | null;
  onOpenLogin?: () => void;
  userProfile: UserProfile;
  bikes: MotorcycleProfile[];
  expenses: ExpenseRecord[];
  onUpdateUserProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDataBackupModal: () => void;
  showSnackbar: (msg: string) => void;
}

type ProfileSection =
  | 'overview'
  | 'my_account'
  | 'edit_profile'
  | 'notifications'
  | 'microinteractions'
  | 'privacy'
  | 'security'
  | 'settings';

export const ProfileView: React.FC<ProfileViewProps> = ({
  session,
  onOpenLogin,
  userProfile,
  bikes,
  expenses,
  onUpdateUserProfile,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onOpenDataBackupModal,
  showSnackbar,
}) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('overview');

  // Edit profile form state
  const [editName, setEditName] = useState(userProfile.name);
  const [editNickname, setEditNickname] = useState(userProfile.nickname || '');
  const [editPhone, setEditPhone] = useState(userProfile.phoneNumber || '');
  const [editStation, setEditStation] = useState(userProfile.preferredGasStation || 'ปตท. (PTT Station)');
  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl || '');

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // Logout Confirmation Dialog state (Requirement 31.9)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Delete Account state (Requirement 31.11)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification toggles
  const [notifyOilDue, setNotifyOilDue] = useState(true);
  const [notifyTaxExpire, setNotifyTaxExpire] = useState(true);
  const [notifyWeeklyMileage, setNotifyWeeklyMileage] = useState(false);

  // Statistics
  const totalBikesCount = bikes.length;
  const totalExpensesAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    feedback('success');
    onUpdateUserProfile({
      ...userProfile,
      name: editName.trim() || userProfile.name,
      nickname: editNickname.trim(),
      phoneNumber: editPhone.trim(),
      preferredGasStation: editStation,
      avatarUrl: editAvatar.trim(),
    });
    showSnackbar('บันทึกข้อมูลโปรไฟล์เรียบร้อย ✓');
    setActiveSection('overview');
  };

  // Change password submission
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);
    if (!session) {
      feedback('alert');
      setPasswordChangeError('คุณกำลังใช้งานในโหมด Guest กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน');
      return;
    }
    setPasswordChangeLoading(true);

    try {
      const res = await changePassword(session.userId, oldPassword, newPassword, confirmNewPassword);
      setPasswordChangeLoading(false);
      if (!res.success) {
        feedback('alert');
        setPasswordChangeError(res.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        return;
      }
      feedback('success');
      setPasswordChangeSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✓');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showSnackbar('เปลี่ยนรหัสผ่านสำเร็จ ✓');
    } catch (err) {
      feedback('alert');
      setPasswordChangeLoading(false);
      setPasswordChangeError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  // 31.11 Delete Account Confirmation
  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountError(null);
    if (!session) {
      setDeleteAccountError('คุณกำลังใช้งานในโหมด Guest ไม่มีบัญชีให้ลบ');
      return;
    }
    setIsDeleting(true);

    try {
      const res = await deleteUserAccount(session.userId, deleteAccountPassword);
      if (!res.success) {
        setDeleteAccountError(res.error || 'รหัสผ่านไม่ถูกต้อง ไม่สามารถลบบัญชีได้');
        setIsDeleting(false);
        return;
      }

      // Also notify backend server
      try {
        await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.userId, password: deleteAccountPassword }),
        });
      } catch (err) {
        // Fallback
      }

      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      showSnackbar('ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว');
      onLogout();
    } catch (err) {
      setIsDeleting(false);
      setDeleteAccountError('เกิดข้อผิดพลาดในการลบบัญชี');
    }
  };

  const navMenuItems = [
    { id: 'my_account', label: 'บัญชีของฉัน', icon: User, desc: 'ข้อมูลบัญชี รหัสผู้ใช้ และสถานะ' },
    { id: 'edit_profile', label: 'แก้ไขโปรไฟล์', icon: Settings, desc: 'ชื่อ เบอร์โทร และรูปภาพ' },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell, desc: 'ตั้งค่าเตือนถ่ายน้ำมันและเอกสาร' },
    { id: 'microinteractions', label: 'เสียง & สั่นสัมผัส', icon: Sparkles, desc: 'การตอบสนองเชิงโต้ตอบ (Microinteractions)' },
    { id: 'privacy', label: 'ความเป็นส่วนตัว', icon: Shield, desc: 'การจัดการข้อมูลและนโยบายความเป็นส่วนตัว' },
    { id: 'security', label: 'ความปลอดภัย', icon: Lock, desc: 'เปลี่ยนรหัสผ่านและเซสชัน' },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings, desc: 'โหมดหน้าจอ หน่วยวัด และลบบัญชี' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 31.8 TOP PROFILE CARD */}
      <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1677FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Avatar & Info */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#1677FF] shadow-lg shadow-[#1677FF]/25"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#1677FF]/30 border border-white/20">
                  {userProfile.name.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-2 border-white dark:border-[#15191E] flex items-center justify-center text-white" title="สถานะออนไลน์">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {userProfile.name}
                </h2>
                {userProfile.nickname && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-[#A7ADB5] border border-slate-200 dark:border-slate-700">
                    ({userProfile.nickname})
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-[#A7ADB5]">
                <Mail className="w-3.5 h-3.5 text-[#1677FF]" />
                <span className="font-mono">{session?.email || userProfile.email || 'guest@motocare.app'}</span>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1677FF]/15 text-[#1677FF] font-mono font-medium border border-[#1677FF]/30">
                  {session ? `User ID: ${session.userId}` : 'โหมด: ผู้เยี่ยมชม (Guest)'}
                </span>
                {session ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-medium border border-[#22C55E]/30">
                    บัญชีผู้ใช้จริง ✓
                  </span>
                ) : onOpenLogin ? (
                  <button
                    onClick={onOpenLogin}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1677FF] hover:bg-[#0D5FD1] text-white font-medium shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>เข้าสู่ระบบเพื่อสำรองข้อมูล</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Quick Stats: Total Bikes & Total Expenses */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-auto w-full">
            {/* 1. จำนวนรถ */}
            <div className="bg-[#0B0D10] border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30 shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-[#A7ADB5]">จำนวนรถในบัญชี</p>
                <p className="text-lg font-bold text-white font-mono">{totalBikesCount} คัน</p>
              </div>
            </div>

            {/* 2. ค่าใช้จ่ายทั้งหมด */}
            <div className="bg-[#0B0D10] border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center border border-[#22C55E]/30 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-[#A7ADB5]">ค่าใช้จ่ายรวมทั้งหมด</p>
                <p className="text-lg font-bold text-white font-mono">฿{totalExpensesAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION & CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Menu List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-2.5 space-y-1.5 shadow-md transition-colors duration-200">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    feedback('tap');
                    setActiveSection(item.id as ProfileSection);
                  }}
                  className={`w-full min-h-[48px] text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer active:scale-98 touch-tactile ${
                    isActive
                      ? 'bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/30 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-[#0B0D10] text-slate-600 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <div className="flex items-center space-x-3.5 truncate">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#0B0D10] text-[#1677FF]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                </button>
              );
            })}

            {/* Logout Menu Item (Requirement 31.9, 34.9 🚪) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="w-full min-h-[48px] text-left p-3 rounded-2xl transition flex items-center justify-between text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">ออกจากระบบ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#EF4444]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Active Section Content */}
        <div className="lg:col-span-3">
          {/* 1. บัญชีของฉัน (My Account) */}
          {(activeSection === 'overview' || activeSection === 'my_account') && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-6 transition-colors duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">บัญชีของฉัน (My Account)</h3>
                    <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">ข้อมูลความปลอดภัยและรายละเอียดประจำตัวผู้ใช้</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 dark:text-[#A7ADB5]">User ID ประจำตัว</p>
                  <p className="text-slate-900 dark:text-white font-mono font-bold text-sm">{session?.userId || 'guest_user'}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">ใช้แยกฐานข้อมูลรถ อะไหล่ และประวัติซ่อมโดยเฉพาะ</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 dark:text-[#A7ADB5]">Email ที่ลงทะเบียน</p>
                  <p className="text-slate-900 dark:text-white font-mono font-bold text-sm">{session?.email || 'ยังไม่ได้เข้าสู่ระบบ (Guest)'}</p>
                  <p className="text-[11px] text-[#22C55E]">{session ? '✓ ยืนยันสิทธิ์แล้ว' : 'โหมดทดลองใช้งาน'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 dark:text-[#A7ADB5]">วันที่สร้างบัญชี</p>
                  <p className="text-slate-800 dark:text-white font-mono font-semibold">
                    {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('th-TH') : '15 มกราคม 2026'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 dark:text-[#A7ADB5]">ระดับความปลอดภัย</p>
                  <p className="text-[#22C55E] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    SHA-256 Hashed Password & Isolated Storage
                  </p>
                </div>
              </div>

              {/* 32.6 & 31.8: รายการรถในบัญชีที่อัปเดตแบบอัตโนมัติ */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-[#1677FF]" />
                    <span>รายการรถมอเตอร์ไซค์ในบัญชี ({bikes.length} คัน)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">เชื่อมโยงข้อมูลอัตโนมัติ</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {bikes.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-[#A7ADB5] font-semibold">
                          {b.brand}
                        </div>
                        <h5 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{b.model || b.name}</h5>
                        <p className="text-xs text-slate-500 dark:text-[#A7ADB5] font-mono mt-0.5">
                          ปี {b.year} • {b.currentMileage.toLocaleString()} km • ทะเบียน {b.plateNumber}
                        </p>
                      </div>

                      <div className="w-24 h-16 rounded-xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        {b.photoUrl ? (
                          <img
                            src={b.photoUrl}
                            alt={b.name}
                            className="w-full h-full object-contain drop-shadow-xs"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                            <Bike className="w-5 h-5" />
                            <span className="text-[9px] text-slate-400 dark:text-[#A7ADB5] mt-0.5">ไม่มีรูป</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PWA & Offline App Installation Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>ติดตั้งแอปพลิเคชัน (PWA / Progressive Web App)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                    Offline Ready
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 dark:from-emerald-950/20 to-blue-500/10 dark:to-blue-950/20 border border-emerald-500/25 space-y-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">ติดตั้งลงในเครื่องเพื่อใช้งานเหมือนแอปจริง 100%</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">
                      • รองรับการใช้งานแบบออฟไลน์ ข้อมูลรถและประวัติซ่อมยังคงดูและบันทึกได้แม้ไม่มีอินเทอร์เน็ต
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">
                      • เข้าถึงได้จากหน้าโฮมของมือถือ (iOS / Android) และเป็นโปรแกรมแยกบนคอมพิวเตอร์ (Chrome / Edge)
                    </p>
                  </div>
                  <div className="max-w-xs">
                    <PWAInstallButton variant="full" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveSection('edit_profile')}
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-semibold transition cursor-pointer shadow-md"
                >
                  แก้ไขข้อมูลส่วนตัว
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className="px-4 py-2 rounded-xl bg-[#0B0D10] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          )}

          {/* 2. แก้ไขโปรไฟล์ (Edit Profile) */}
          {activeSection === 'edit_profile' && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-5 transition-colors duration-200">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">แก้ไขโปรไฟล์ (Edit Profile)</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">ปรับปรุงชื่อผู้ใช้งาน เบอร์ติดต่อ และปั๊มน้ำมันประจำ</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ชื่อผู้ใช้งาน *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="เช่น แบงค์"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white font-mono focus:border-[#1677FF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ปั๊มน้ำมันที่เติมประจำ</label>
                  <select
                    value={editStation}
                    onChange={(e) => setEditStation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white focus:border-[#1677FF] outline-none cursor-pointer"
                  >
                    <option value="ปตท. (PTT Station)">ปตท. (PTT Station)</option>
                    <option value="บางจาก (Bangchak)">บางจาก (Bangchak)</option>
                    <option value="เชลล์ (Shell)">เชลล์ (Shell)</option>
                    <option value="คาลเท็กซ์ (Caltex)">คาลเท็กซ์ (Caltex)</option>
                    <option value="พีที (PT)">พีที (PT)</option>
                    <option value="ซัสโก้ (Susco)">ซัสโก้ (Susco)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL รูปประจำตัว (Avatar)</label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-xs focus:border-[#1677FF] outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveSection('overview')}
                    className="px-4 py-2 rounded-xl text-[#A7ADB5] hover:text-white text-xs cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white font-semibold text-xs shadow-md transition cursor-pointer"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. การแจ้งเตือน (Notifications) */}
          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-5 transition-colors duration-200">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">การแจ้งเตือน (Notifications)</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">กำหนดเงื่อนไขการเตือนรอบเซอร์วิสและเอกสารรถ</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">แจ้งเตือนเปลี่ยนถ่ายน้ำมันเครื่อง</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">เตือนเมื่อระยะทางเหลือน้อยกว่า 300 กม. หรือเกินกำหนด</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOilDue}
                    onChange={(e) => setNotifyOilDue(e.target.checked)}
                    className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">แจ้งเตือน พ.ร.บ. / ภาษี / ประกัน</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">เตือนล่วงหน้า 30 วันก่อนวันหมดอายุ</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyTaxExpire}
                    onChange={(e) => setNotifyTaxExpire(e.target.checked)}
                    className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">เตือนจดบันทึกเลขไมล์สัปดาห์ละครั้ง</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">ช่วยคำนวณอัตราเฉลี่ย กม./วัน ให้แม่นยำ</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyWeeklyMileage}
                    onChange={(e) => setNotifyWeeklyMileage(e.target.checked)}
                    className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* การตอบสนองเชิงโต้ตอบ (Microinteractions) */}
          {activeSection === 'microinteractions' && (
            <div className="space-y-6">
              <MicrointeractionSettingsCard onNotifyChange={showSnackbar} />
            </div>
          )}

          {/* 4. ความเป็นส่วนตัว (Privacy) */}
          {activeSection === 'privacy' && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-5 transition-colors duration-200">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ความเป็นส่วนตัว (Privacy & Data Protection)</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">นโยบายการจัดเก็บและปกป้องข้อมูลของคุณ</p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    การแยกข้อมูลโดยเด็ดขาดตาม User ID (31.7 & 31.14)
                  </p>
                  <p>
                    ข้อมูลรถมอเตอร์ไซค์ บันทึกน้ำมัน ค่าใช้จ่าย ประวัติการซ่อม เอกสาร และสถิติทั้งหมด เชื่อมโยงกับรหัสประจำตัวของคุณ (<strong className="text-slate-900 dark:text-white font-mono">{session?.userId || 'guest'}</strong>) เท่านั้น ผู้ใช้คนอื่นไม่สามารถมองเห็นข้อมูลของคุณได้
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#1677FF]" />
                    รหัสผ่านถูกเข้ารหัสเสมอ (Hashed Password)
                  </p>
                  <p>
                    ระบบไม่เคยจัดเก็บรหัสผ่านแบบ Plain Text รหัสผ่านทุกชุดถูกผสม Salt เฉพาะตัวและเข้ารหัสด้วยอัลกอริทึม SHA-256 ตามมาตรฐานสากล
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#F59E0B]" />
                    สิทธิ์ความเป็นเจ้าของข้อมูล 100%
                  </p>
                  <p>
                    คุณสามารถส่งออกข้อมูลทั้งหมดเป็นไฟล์ JSON เพื่อสำรองไว้ หรือสั่งลบบัญชีและข้อมูลทั้งหมดได้ทันทีในหน้าการตั้งค่า
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. ความปลอดภัย (Security) */}
          {activeSection === 'security' && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-6 transition-colors duration-200">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ความปลอดภัย (Security)</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">เปลี่ยนรหัสผ่านและตรวจสอบเซสชันการเข้าสู่ระบบ</p>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#1677FF]" />
                    เปลี่ยนรหัสผ่าน
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-xs text-slate-500 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showPasswordFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswordFields ? 'ซ่อนตัวอักษร' : 'แสดงตัวอักษร'}</span>
                  </button>
                </div>

                {passwordChangeError && (
                  <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs">
                    {passwordChangeError}
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">รหัสผ่านปัจจุบัน *</label>
                    <input
                      type={showPasswordFields ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#15191E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#1677FF] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) *</label>
                      <input
                        type={showPasswordFields ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#15191E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#1677FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ยืนยันรหัสผ่านใหม่ *</label>
                      <input
                        type={showPasswordFields ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#15191E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#1677FF] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordChangeLoading}
                      className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-60"
                    >
                      {passwordChangeLoading ? 'กำลังเปลี่ยนรหัสผ่าน…' : 'อัปเดตรหัสผ่านใหม่'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Session Info (31.6) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#1677FF]" />
                  เซสชันปัจจุบัน (Active Session)
                </p>
                {session ? (
                  <>
                    <p className="text-slate-600 dark:text-[#A7ADB5]">
                      โทเคน: <span className="font-mono text-slate-900 dark:text-white">{session.token.substring(0, 16)}...</span>
                    </p>
                    <p className="text-slate-600 dark:text-[#A7ADB5]">
                      สถานะ: <span className="text-[#22C55E] font-semibold">ใช้งานได้ (Valid)</span>
                    </p>
                    <p className="text-slate-600 dark:text-[#A7ADB5]">
                      หมดอายุใน: <span className="font-mono text-slate-900 dark:text-white">{new Date(session.expiresAt).toLocaleDateString('th-TH')}</span> (7 วัน)
                    </p>
                  </>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-slate-500 dark:text-slate-400">
                      กำลังใช้งานในโหมดผู้เยี่ยมชม (Guest Mode) ข้อมูลถูกจัดเก็บใน Local Storage ของเครื่องนี้
                    </p>
                    {onOpenLogin && (
                      <button
                        onClick={onOpenLogin}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>เข้าสู่ระบบเพื่อเปิดใช้งานเซสชัน</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. ตั้งค่าระบบ & ลบบัญชี (Settings & Delete Account - 31.11) */}
          {activeSection === 'settings' && (
            <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-md space-y-6 transition-colors duration-200">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/15 text-[#1677FF] flex items-center justify-center border border-[#1677FF]/30">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ตั้งค่า (Settings)</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A7ADB5]">ปรับแต่งการทำงานของแอป สำรองข้อมูล และการจัดการบัญชี</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Theme Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    {isDarkMode ? <Moon className="w-5 h-5 text-[#1677FF]" /> : <Sun className="w-5 h-5 text-[#F59E0B]" />}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">โหมดธีมแสดงผล</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#A7ADB5]">
                        ปัจจุบัน: {isDarkMode ? '🌙 โหมดมืด (Dark Mode)' : '☀️ โหมดสว่าง (Light Mode)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-850 p-1 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        !isDarkMode
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>โหมดสว่าง</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#1677FF] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>โหมดมืด</span>
                    </button>
                  </div>
                </div>

                {/* Microinteractions settings */}
                <div className="pt-2">
                  <MicrointeractionSettingsCard onNotifyChange={showSnackbar} />
                </div>

                {/* Data Backup Modal Trigger */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D10] border border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <Database className="w-4 h-4 text-[#22C55E]" />
                    <div>
                      <p className="font-semibold text-white">สำรองและส่งออกข้อมูล (Export / Import)</p>
                      <p className="text-[11px] text-[#A7ADB5]">ดาวน์โหลดไฟล์ JSON บันทึกข้อมูลรถของคุณ</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenDataBackupModal}
                    className="px-3.5 py-1.5 rounded-xl bg-[#15191E] border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
                  >
                    เปิดจัดการ
                  </button>
                </div>

                {/* 31.11 DANGER ZONE: DELETE ACCOUNT */}
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#EF4444] text-sm">โซนอันตราย: ลบบัญชีผู้ใช้ (Delete Account)</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        การลบบัญชีอาจทำให้ข้อมูลรถ ประวัติซ่อม ค่าใช้จ่าย และข้อมูลอื่น ๆ ถูกลบอย่างถาวร
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบบัญชี</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 31.9 LOGOUT CONFIRMATION MODAL */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#15191E] border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto border border-[#EF4444]/30">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-white text-base">คุณต้องการออกจากระบบหรือไม่?</h3>
              <p className="text-xs text-[#A7ADB5]">
                ข้อมูลรถและประวัติการซ่อมทั้งหมดจะยังคงถูกบันทึกไว้อย่างปลอดภัย คุณสามารถกลับมาเข้าสู่ระบบเพื่อใช้งานได้ทุกเมื่อ
              </p>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutDialogOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 31.11 DELETE ACCOUNT CONFIRMATION MODAL WITH PASSWORD */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="bg-[#15191E] border border-[#EF4444]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto border border-[#EF4444]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-white text-base">ยืนยันการลบบัญชีผู้ใช้</h3>
              <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium leading-relaxed text-left">
                ⚠️ การลบบัญชีอาจทำให้ข้อมูลรถ ประวัติซ่อม ค่าใช้จ่าย และข้อมูลอื่น ๆ ถูกลบอย่างถาวร ไม่สามารถกู้คืนได้
              </div>
            </div>

            {deleteAccountError && (
              <div className="p-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold">
                {deleteAccountError}
              </div>
            )}

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  กรุณากรอก Password ของคุณเพื่อยืนยันตัวตนก่อนลบบัญชี *
                </label>
                <input
                  type="password"
                  required
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#EF4444] outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteAccountPassword('');
                    setDeleteAccountError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'กำลังลบบัญชี…' : 'ยืนยันลบบัญชีถาวร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
