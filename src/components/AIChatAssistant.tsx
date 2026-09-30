import React, { useState, useRef, useEffect } from 'react';
import { MotorcycleProfile, ExpenseRecord, MaintenanceItem, ChatMessage, GroundingSource } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Copy,
  Check,
  Wrench,
  Zap,
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Compass,
  AlertTriangle,
  LocateFixed,
  Layers,
  MessageSquare,
  Quote,
  ShieldCheck,
} from 'lucide-react';

interface AIChatAssistantProps {
  bike: MotorcycleProfile;
  expenses: ExpenseRecord[];
  maintenanceItems: MaintenanceItem[];
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

type GroundingMode = 'auto' | 'maps' | 'search' | 'diagnostic';

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  bike,
  expenses,
  maintenanceItems,
  prefilledPrompt,
  onClearPrefilledPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `สวัสดีครับ! ผมคือ **ช่างยนต์ AI ผู้ช่วยดูแลมอเตอร์ไซค์** 🛵✨
พร้อมระบบสืบค้นข้อมูลคู่ใจ:
• 📍 **Google Maps Grounding**: ค้นหาร้านซ่อม อู่ปะยาง ศูนย์บริการ และปั๊มน้ำมันใกล้พิกัดของคุณ
• 🔍 **Google Search Grounding**: อัปเดตราคาอะไหล่ สเปกน้ำมันเครื่อง และข้อมูลล่าสุดปี 2026

ขณะนี้กำลังดูแลรถ: **${bike.name}** (ปี ${bike.year}, ทะเบียน ${bike.plateNumber})
เลขไมล์ปัจจุบัน: **${bike.currentMileage.toLocaleString()} กม.**

มีเรื่องเกี่ยวกับรถหรือต้องการค้นหาร้านซ่อมตรงไหน สอบถามได้เลยครับ!`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groundingMode, setGroundingMode] = useState<GroundingMode>('auto');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; label?: string } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [activePromptTab, setActivePromptTab] = useState<'all' | 'maps' | 'search' | 'diagnostic'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Request user geolocation for Google Maps grounding
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          label: `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`,
        };
        setUserLocation(coords);
        setLocationStatus('granted');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (prefilledPrompt) {
      setInput(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt]);

  const quickPromptsGrouped = [
    {
      category: 'maps',
      icon: MapPin,
      label: 'แผนที่ & ร้านซ่อม',
      prompts: [
        'ค้นหาร้านซ่อมมอเตอร์ไซค์และอู่ใกล้ฉัน',
        `ศูนย์บริการทางการ ${bike.brand} ใกล้เคียง`,
        'ร้านปะยางและเปลี่ยนยางมอเตอร์ไซค์ด่วนใกล้ฉัน',
        'ร้านเปลี่ยนถ่ายน้ำมันเครื่องมอเตอร์ไซค์ใกล้ฉัน',
      ],
    },
    {
      category: 'search',
      icon: Search,
      label: 'เช็คราคา & ข้อมูลสด',
      prompts: [
        `เช็คราคาน้ำมันเครื่องสังเคราะห์แท้สำหรับ ${bike.name} ปี 2026`,
        `ราคาผ้าเบรกและยางสำหรับ ${bike.name} ล่าสุด`,
        `ปัญหาประจำรุ่นและจุดที่ต้องระวังของ ${bike.name}`,
        'อัตราค่าต่อภาษีและ พ.ร.บ. มอเตอร์ไซค์ปีนี้',
      ],
    },
    {
      category: 'diagnostic',
      icon: Wrench,
      label: 'วิเคราะห์อาการช่าง',
      prompts: [
        `เลขไมล์ ${bike.currentMileage.toLocaleString()} กม. ถึงเวลาต้องเช็คหรือเปลี่ยนอะไหล่อะไรบ้าง?`,
        'สตาร์ทไม่ติด มีเสียงแชะๆ เกิดจากอะไรและตรวจเช็คเองได้อย่างไร?',
        'เวลาเบรกมีเสียงดังจี๊ดๆ แหลมๆ อันตรายไหมและเกิดจากสาเหตุใด?',
        'ออกตัวมีอาการกระตุก สั่น หรือรอบตก เกิดจากชิ้นส่วนใด?',
      ],
    },
  ];

  const handleSendMessage = async (textToSend?: string, forcedMode?: GroundingMode) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const currentMode = forcedMode || groundingMode;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const vehicleContext = {
        model: bike.name,
        brand: bike.brand,
        plate: bike.plateNumber,
        year: bike.year,
        bikeType: bike.bikeType,
        driveType: bike.driveType,
        currentMileage: bike.currentMileage,
        dailyAverageKm: bike.dailyAverageKm,
        oilChangeIntervalKm: bike.oilChangeIntervalKm,
        lastOilChangeMileage: bike.lastOilChangeMileage,
        lastOilChangeDate: bike.lastOilChangeDate,
        recommendedOilGrade: bike.recommendedOilGrade,
        maintenanceChecklist: maintenanceItems.map((m) => ({
          name: m.thaiName,
          intervalKm: m.intervalKm,
          lastServiceMileage: m.lastServiceMileage,
          kmRemaining: m.lastServiceMileage + m.intervalKm - bike.currentMileage,
        })),
        recentExpenses: expenses.slice(-5).map((e) => ({
          date: e.date,
          title: e.title,
          category: e.category,
          amount: e.amount,
          mileage: e.mileage,
        })),
      };

      const sessionRaw = localStorage.getItem('motocare_current_session_v2');
      let token = '';
      if (sessionRaw) {
        try {
          const parsed = JSON.parse(sessionRaw);
          token = parsed.token || '';
        } catch (e) {}
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}`, 'x-session-token': token } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          vehicleContext,
          mode: currentMode === 'diagnostic' ? 'none' : currentMode,
          userLocation: userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
        }),
      });

      const data = await res.json();
      const replyContent =
        data.reply || 'ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          groundingType: data.groundingType || undefined,
          sources: data.sources || [],
          searchQueries: data.searchQueries || [],
          userLocationUsed: data.userLocationUsed || null,
          isQuotaFallback: Boolean(data.isQuotaFallback),
        },
      ]);
    } catch (err: any) {
      console.warn('Chat request handled with fallback:', err?.message);
      const fallbackText = `ขออภัยครับ ขณะนี้ระบบการเชื่อมต่อ AI กำลังปรับปรุงข้อมูล สำหรับรถ **${bike.name}** ของคุณ:\n\n• **น้ำมันเครื่องที่แนะนำ:** ${bike.recommendedOilGrade}\n• **รอบเปลี่ยนถ่าย:** ทุกๆ ${bike.oilChangeIntervalKm.toLocaleString()} กม.\n• **เลขไมล์ปัจจุบัน:** ${bike.currentMileage.toLocaleString()} กม.\n\nหากมีข้อสงสัยเร่งด่วนเกี่ยวกับอาการเบรกหรือเครื่องยนต์ แนะนำนำรถเข้าศูนย์บริการฮอนด้าหรืออู่ช่างผู้เชี่ยวชาญเพื่อความปลอดภัยครับ`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          isQuotaFallback: true,
          sources: [
            {
              type: 'maps',
              title: `ศูนย์บริการ ${bike.brand} ใกล้ฉัน`,
              uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ศูนย์บริการ " + bike.brand + " ใกล้ฉัน")}`,
            },
            {
              type: 'maps',
              title: 'ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน',
              uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน")}`,
            }
          ]
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Remaining oil distance
  const kmSinceLastOil = bike.currentMileage - bike.lastOilChangeMileage;
  const kmUntilNextOil = Math.max(0, bike.oilChangeIntervalKm - kmSinceLastOil);

  return (
    <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[780px] max-h-[88vh] transition-colors duration-200">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">ช่าง AI ผู้เชี่ยวชาญมอเตอร์ไซค์</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gemini 3.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span>รถ: <strong className="text-blue-600 dark:text-blue-400">{bike.name}</strong></span>
                <span>•</span>
                <span>ไมล์ {bike.currentMileage.toLocaleString()} km</span>
                <span>•</span>
                <span className={kmUntilNextOil <= 300 ? 'text-amber-500 font-medium' : 'text-slate-400'}>
                  เปลี่ยนน้ำมันใน {kmUntilNextOil.toLocaleString()} km
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    role: 'assistant',
                    content: `เริ่มการสนทนาใหม่ครับ! รถของคุณคือ **${bike.name}** เลขไมล์ **${bike.currentMileage.toLocaleString()} กม.** คุณสามารถถามหาร้านซ่อมใกล้ตัว หรือเช็คราคาน้ำมันเครื่องและอะไหล่ล่าสุดได้เลยครับ 🛵`,
                    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="เริ่มการสนทนาใหม่"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grounding Controls & GPS Bar */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Grounding Mode Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setGroundingMode('auto')}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 font-medium cursor-pointer ${
                groundingMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ อัจฉริยะ (Auto)</span>
            </button>
            <button
              onClick={() => {
                setGroundingMode('maps');
                if (locationStatus === 'idle') requestLocation();
              }}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 font-medium cursor-pointer ${
                groundingMode === 'maps'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>📍 Google Maps</span>
            </button>
            <button
              onClick={() => setGroundingMode('search')}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 font-medium cursor-pointer ${
                groundingMode === 'search'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>🔍 Google Search</span>
            </button>
          </div>

          {/* GPS Location Pill */}
          <div className="flex items-center">
            {locationStatus === 'granted' && userLocation ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-300">
                <LocateFixed className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>พิกัด GPS พร้อมใช้งาน ({userLocation.label})</span>
                <button
                  onClick={() => {
                    setUserLocation(null);
                    setLocationStatus('idle');
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-500 cursor-pointer text-xs"
                  title="ปิดการแชร์พิกัด"
                >
                  ✕
                </button>
              </div>
            ) : locationStatus === 'locating' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-600 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>กำลังดึงพิกัด GPS...</span>
              </div>
            ) : (
              <button
                onClick={requestLocation}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="แชร์พิกัด GPS เพื่อค้นหาอู่ใกล้ตัวที่แม่นยำขึ้น"
              >
                <Compass className="w-3.5 h-3.5 text-rose-500" />
                <span>แชร์พิกัด GPS เพื่อค้นหาร้านใกล้ตัว</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-transparent">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const hasMaps = m.sources?.some((s) => s.type === 'maps');
          const hasWeb = m.sources?.some((s) => s.type === 'web');

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#1677FF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-[#1677FF] dark:text-blue-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[88%] sm:max-w-[80%] space-y-2">
                {/* Main Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-[#1677FF] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-slate-850/95 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {m.content}
                </div>

                {/* Quota / Demand Advisory Notice */}
                {!isUser && m.isQuotaFallback && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>คำแนะนำนี้ประมวลผลจากฐานข้อมูลสเปกมอเตอร์ไซค์ของคุณ (โควตาคำขอ AI ถึงขีดจำกัดชั่วคราว คุณสามารถเลือกหรืออัปเกรด API Key ได้ที่เมนู <strong>Settings &gt; Secrets</strong>)</span>
                  </div>
                )}

                {/* Grounding Tool Badges & Metadata */}
                {!isUser && (m.groundingType || (m.sources && m.sources.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {hasMaps && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        Google Maps Grounding
                      </span>
                    )}
                    {hasWeb && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                        <Search className="w-3 h-3 text-blue-500" />
                        Google Search Grounding
                      </span>
                    )}
                    {m.userLocationUsed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <LocateFixed className="w-3 h-3 text-emerald-500" />
                        อิงพิกัด GPS ของคุณ
                      </span>
                    )}
                  </div>
                )}

                {/* Google Maps Grounding Places Card Display */}
                {!isUser && m.sources && m.sources.filter((s) => s.type === 'maps').length > 0 && (
                  <div className="rounded-2xl p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>สถานที่และอู่แนะนำบน Google Maps</span>
                      </div>
                      <span className="text-[10px] text-rose-500">
                        {m.sources.filter((s) => s.type === 'maps').length} แห่ง
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.sources
                        .filter((s) => s.type === 'maps')
                        .map((source, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                                {source.title}
                              </div>
                              {source.reviewSnippets && source.reviewSnippets.length > 0 && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                                  "{source.reviewSnippets[0]}"
                                </p>
                              )}
                            </div>

                            {source.uri && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <a
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline"
                                >
                                  <span>เปิดใน Google Maps</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                    source.title
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-[10px] font-medium hover:bg-rose-100 transition"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>นำทาง</span>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Google Search Citations Display */}
                {!isUser && m.sources && m.sources.filter((s) => s.type === 'web').length > 0 && (
                  <div className="rounded-2xl p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>แหล่งข้อมูลอ้างอิงจาก Google Search</span>
                      </div>
                      <span className="text-[10px] text-blue-500">
                        {m.sources.filter((s) => s.type === 'web').length} แหล่งข้อมูล
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {m.sources
                        .filter((s) => s.type === 'web')
                        .map((source, sIdx) => {
                          let hostname = '';
                          try {
                            hostname = new URL(source.uri).hostname.replace('www.', '');
                          } catch (e) {
                            hostname = 'Web';
                          }

                          return (
                            <a
                              key={sIdx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition shadow-xs group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              <span className="font-medium truncate max-w-[180px]">{source.title}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-blue-500">
                                ({hostname})
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                            </a>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Web Search Queries used */}
                {!isUser && m.searchQueries && m.searchQueries.length > 0 && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-wrap px-1">
                    <span>คำค้นหาที่ใช้:</span>
                    {m.searchQueries.map((q, qIdx) => (
                      <span
                        key={qIdx}
                        className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer with Timestamp and Copy Button */}
                <div
                  className={`flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyMessage(m.id, m.content)}
                      className="hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer p-0.5 rounded"
                      title="คัดลอกข้อความ"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1677FF] dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-ping"></span>
                <span>
                  {groundingMode === 'maps'
                    ? 'กำลังค้นหาพิกัดและข้อมูลร้านซ่อมบน Google Maps...'
                    : groundingMode === 'search'
                    ? 'กำลังสืบค้นข้อมูลล่าสุดผ่าน Google Search...'
                    : 'ช่าง AI กำลังวิเคราะห์อาการและสืบค้นข้อมูล...'}
                </span>
              </div>
              <div className="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions by Category */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 sm:p-3 space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => setActivePromptTab('all')}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer font-medium ${
                activePromptTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setActivePromptTab('maps')}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1 font-medium ${
                activePromptTab === 'maps'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>แผนที่ & ร้าน</span>
            </button>
            <button
              onClick={() => setActivePromptTab('search')}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1 font-medium ${
                activePromptTab === 'search'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-3 h-3 text-blue-500" />
              <span>ราคา & สเปกสด</span>
            </button>
            <button
              onClick={() => setActivePromptTab('diagnostic')}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1 font-medium ${
                activePromptTab === 'diagnostic'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-3 h-3 text-amber-500" />
              <span>วิเคราะห์อาการ</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-none flex gap-2 py-1">
          {quickPromptsGrouped
            .filter((g) => activePromptTab === 'all' || g.category === activePromptTab)
            .flatMap((g) =>
              g.prompts.map((p, idx) => {
                const IconComponent = g.icon;
                return (
                  <button
                    key={`${g.category}-${idx}`}
                    onClick={() => {
                      if (g.category === 'maps') {
                        setGroundingMode('maps');
                        if (locationStatus === 'idle') requestLocation();
                        handleSendMessage(p, 'maps');
                      } else if (g.category === 'search') {
                        setGroundingMode('search');
                        handleSendMessage(p, 'search');
                      } else {
                        handleSendMessage(p);
                      }
                    }}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-[11px] transition cursor-pointer flex items-center space-x-1.5 shadow-xs shrink-0"
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 shrink-0 ${
                        g.category === 'maps'
                          ? 'text-rose-500'
                          : g.category === 'search'
                          ? 'text-blue-500'
                          : 'text-amber-500'
                      }`}
                    />
                    <span>{p}</span>
                  </button>
                );
              })
            )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                groundingMode === 'maps'
                  ? `ค้นหาร้านซ่อม ศูนย์บริการ หรือปั๊มน้ำมันใกล้ฉันสำหรับ ${bike.name}...`
                  : groundingMode === 'search'
                  ? `ค้นหาราคาน้ำมันเครื่อง อะไหล่ หรือข้อมูลสดสำหรับ ${bike.name}...`
                  : `พิมพ์ถามช่าง AI หรือค้นหาร้านซ่อมสำหรับ ${bike.name}...`
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-[#1677FF] outline-none"
            />
            {groundingMode === 'maps' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500" title="โหมดค้นหาแผนที่ Google Maps">
                <MapPin className="w-4 h-4" />
              </span>
            )}
            {groundingMode === 'search' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" title="โหมดค้นหาเว็บสด Google Search">
                <Search className="w-4 h-4" />
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-[#1677FF] hover:bg-[#0D5FD1] active:scale-95 disabled:opacity-40 text-white transition cursor-pointer shadow-md shadow-[#1677FF]/30 shrink-0 flex items-center justify-center min-w-[48px] min-h-[48px]"
            title="ส่งข้อความถามช่าง AI"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
