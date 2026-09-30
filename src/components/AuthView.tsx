import React, { useState } from 'react';
import { Bike, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { loginUser, registerUser, DEMO_CREDENTIALS } from '../utils/authService';
import { UserSession } from '../types';

interface AuthViewProps {
  onAuthSuccess: (session: UserSession) => void;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
  isModal?: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  onClose,
  onContinueAsGuest,
  isModal = false,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear messages when switching modes
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 31.3 Login Handler & Validations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password;

    // 31.3 Client validations
    if (!trimmedEmail) {
      setErrorMessage('กรุณากรอก Email');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('กรุณากรอก Email ให้ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate real auth network latency (300ms) and call login
      await new Promise((res) => setTimeout(res, 350));
      const res = await loginUser(trimmedEmail, trimmedPass);

      if (!res.success || !res.session) {
        setErrorMessage(res.error || 'Email หรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }

      // Also notify server backend
      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPass }),
        });
      } catch (err) {
        console.warn('Backend sync warning (running offline fallback):', err);
      }

      setSuccessMessage('เข้าสู่ระบบสำเร็จ ✓');
      setTimeout(() => {
        if (res.session) onAuthSuccess(res.session);
      }, 300);
    } catch (err) {
      console.error(err);
      setErrorMessage('Email หรือรหัสผ่านไม่ถูกต้อง');
      setIsLoading(false);
    }
  };

  // 31.4 Register Handler & Validations
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password;
    const trimmedConfirm = confirmPassword;

    // 31.4 Validation rules
    if (!trimmedName) {
      setErrorMessage('กรุณากรอกชื่อของคุณ');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('กรุณากรอก Email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('กรุณากรอก Email ให้ถูกต้อง');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (trimmedPass.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (trimmedPass !== trimmedConfirm) {
      setErrorMessage('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 400));
      const res = await registerUser(trimmedName, trimmedEmail, trimmedPass, trimmedConfirm);

      if (!res.success || !res.session) {
        setErrorMessage(res.error || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
        setIsLoading(false);
        return;
      }

      // Sync with server backend
      try {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPass,
            confirmPassword: trimmedConfirm,
          }),
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }

      // 31.4 Display success message
      setSuccessMessage('สร้างบัญชีเรียบร้อย ✓');

      // Auto login into system
      setTimeout(() => {
        if (res.session) onAuthSuccess(res.session);
      }, 700);
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการสร้างบัญชี');
      setIsLoading(false);
    }
  };

  // 31.5 Forgot Password Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('กรุณากรอก Email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('กรุณากรอก Email ให้ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 450));
      // Call backend forgot password API
      try {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        });
      } catch (err) {
        // Fallback
      }

      setIsLoading(false);
      // 31.5 exact prompt message
      setSuccessMessage('หาก Email นี้มีบัญชีอยู่ ระบบจะส่งคำแนะนำในการรีเซ็ตรหัสผ่านให้');
    } catch (err) {
      setIsLoading(false);
      setSuccessMessage('หาก Email นี้มีบัญชีอยู่ ระบบจะส่งคำแนะนำในการรีเซ็ตรหัสผ่านให้');
    }
  };

  // Quick Demo Login helper
  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  };

  return (
    <div
      className={
        isModal
          ? "w-full text-white flex flex-col justify-center items-center relative font-['Prompt',sans-serif] selection:bg-[#1677FF] selection:text-white"
          : "min-h-screen bg-[#0B0D10] text-white flex flex-col justify-center items-center px-4 py-8 relative font-['Prompt',sans-serif] selection:bg-[#1677FF] selection:text-white"
      }
    >
      {/* Background ambient lighting */}
      {!isModal && (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1677FF]/12 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#0D5FD1]/10 rounded-full blur-2xl pointer-events-none"></div>
        </>
      )}

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#15191E] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10 backdrop-blur-md animate-in fade-in zoom-in-98 duration-200">
        {/* Close Button if Modal or Provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="ปิดหน้าต่าง"
            aria-label="ปิดหน้าต่าง"
          >
            ✕
          </button>
        )}
        
        {/* Top Logo & App Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#0D5FD1] flex items-center justify-center text-white shadow-lg shadow-[#1677FF]/30 border border-white/10 mb-3.5">
            <Bike className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>

          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">MotoCare</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1677FF]/20 text-[#1677FF] font-semibold border border-[#1677FF]/30">
              Test
            </span>
          </div>
          <p className="text-xs text-[#A7ADB5] mt-1">ดูแลรถของคุณให้ง่ายขึ้น</p>
        </div>

        {/* MODE 1: LOGIN (Requirement 31.2 & 31.3) */}
        {mode === 'login' && (
          <div>
            <div className="mb-5 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                ยินดีต้อนรับกลับ 👋
              </h2>
              <p className="text-xs text-[#A7ADB5] mt-1">
                เข้าสู่ระบบเพื่อจัดการรถของคุณ
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center space-x-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@motocare.app"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-xs text-[#1677FF] hover:text-[#0D5FD1] transition cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7ADB5] hover:text-white transition cursor-pointer"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-[#1677FF]/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ…</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 px-3 rounded-xl bg-[#0B0D10] hover:bg-slate-800 border border-slate-700 text-[#A7ADB5] hover:text-white text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>ใช้บัญชีทดสอบด่วน: <strong className="text-white font-mono">{DEMO_CREDENTIALS.email}</strong></span>
              </button>
            </div>

            {/* Switch to Register */}
            <div className="mt-5 text-center text-xs text-[#A7ADB5]">
              <span>ยังไม่มีบัญชี? </span>
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="text-[#1677FF] hover:underline font-semibold cursor-pointer ml-1"
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* Continue as Guest Button */}
            {(onContinueAsGuest || onClose) && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) onContinueAsGuest();
                    else if (onClose) onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-white hover:underline flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
                >
                  <span>ข้ามไปทดลองใช้งานในโหมด Guest</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1677FF]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: REGISTER (Requirement 31.4) */}
        {mode === 'register' && (
          <div>
            <div className="mb-5 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                สมัครสมาชิกใหม่ 🏍️
              </h2>
              <p className="text-xs text-[#A7ADB5] mt-1">
                สร้างบัญชี MotoCare เพื่อเริ่มจัดการรถของคุณ
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center space-x-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span className="font-bold text-[#22C55E]">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อ *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai@example.com"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password * (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7ADB5] hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ยืนยัน Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7ADB5] hover:text-white transition cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-[#1677FF]/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังสร้างบัญชี…</span>
                  </>
                ) : (
                  <span>สร้างบัญชี</span>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-5 text-center text-xs text-[#A7ADB5]">
              <span>มีบัญชีอยู่แล้ว? </span>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-[#1677FF] hover:underline font-semibold cursor-pointer ml-1"
              >
                เข้าสู่ระบบ
              </button>
            </div>

            {/* Continue as Guest Button */}
            {(onContinueAsGuest || onClose) && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) onContinueAsGuest();
                    else if (onClose) onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-white hover:underline flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
                >
                  <span>ข้ามไปทดลองใช้งานในโหมด Guest</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1677FF]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD (Requirement 31.5) */}
        {mode === 'forgot_password' && (
          <div>
            <div className="mb-5 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                ลืมรหัสผ่าน? 🔑
              </h2>
              <p className="text-xs text-[#A7ADB5] mt-1">
                กรอก Email ของคุณเพื่อรับคำแนะนำในการตั้งรหัสผ่านใหม่
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Message (31.5) */}
            {successMessage ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-white text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-[#22C55E] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ส่งข้อมูลเรียบร้อย</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {successMessage}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7ADB5]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@motocare.app"
                      disabled={isLoading}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-slate-700 text-white text-sm focus:border-[#1677FF] outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-[#1677FF]/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งคำขอ…</span>
                    </>
                  ) : (
                    <span>ส่งคำขอรีเซ็ตรหัสผ่าน</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs text-[#A7ADB5] hover:text-white transition cursor-pointer"
                  >
                    ← ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Security info note below card */}
      <div className="mt-6 text-center text-xs text-slate-500 max-w-sm flex items-center justify-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-[#1677FF]" />
        <span>ระบบความปลอดภัยมาตรฐาน SHA-256 แยกข้อมูลส่วนบุคคลตาม User ID</span>
      </div>
    </div>
  );
};
