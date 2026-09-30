import React, { useState } from 'react';
import { MileageLog, MotorcycleProfile } from '../types';
import { Gauge, Plus, Calendar, TrendingUp, Navigation, Zap, Trash2, CheckCircle } from 'lucide-react';
import { feedback } from '../utils/feedback';
import { AnimatedCounter } from './AnimatedCounter';

interface MileageTrackerProps {
  bike: MotorcycleProfile;
  mileageLogs: MileageLog[];
  onAddMileageLog: (log: { mileage: number; date: string; note: string; type: MileageLog['type'] }) => void;
  onDeleteLog: (id: string) => void;
  onUpdateDailyAverage: (newDailyKm: number) => void;
}

export const MileageTracker: React.FC<MileageTrackerProps> = ({
  bike,
  mileageLogs,
  onAddMileageLog,
  onDeleteLog,
  onUpdateDailyAverage,
}) => {
  const currentLogs = mileageLogs
    .filter((l) => l.bikeId === bike.id || !l.bikeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [newMileage, setNewMileage] = useState(bike.currentMileage + 25);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('บันทึกประจำวัน');
  const [logType, setLogType] = useState<MileageLog['type']>('manual');
  
  const [commuteDistance, setCommuteDistance] = useState(bike.dailyAverageKm || 25);
  const [isEditingCommute, setIsEditingCommute] = useState(false);
  const [justLoggedAlert, setJustLoggedAlert] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMileage <= 0) return;
    feedback('success');
    onAddMileageLog({
      mileage: Number(newMileage),
      date: logDate,
      note,
      type: logType,
    });
    setJustLoggedAlert(`บันทึกเลขไมล์ ${newMileage.toLocaleString()} กม. สำเร็จ!`);
    setTimeout(() => setJustLoggedAlert(null), 3000);
  };

  const handleAutoLogCommute = () => {
    const updatedMileage = bike.currentMileage + commuteDistance;
    const todayStr = new Date().toISOString().split('T')[0];
    feedback('success');
    onAddMileageLog({
      mileage: updatedMileage,
      date: todayStr,
      note: `จดไมล์อัตโนมัติ: ระยะทางไป-กลับประจำวัน (+${commuteDistance} กม.)`,
      type: 'daily_commute',
    });
    setNewMileage(updatedMileage + commuteDistance);
    setJustLoggedAlert(`บันทึกไมล์เดินทางประจำวัน +${commuteDistance} กม. (ไมล์ใหม่: ${updatedMileage.toLocaleString()} กม.)`);
    setTimeout(() => setJustLoggedAlert(null), 3500);
  };

  const handleBumperClick = (km: number) => {
    feedback('odometer');
    setNewMileage(bike.currentMileage + km);
  };

  const handleSaveCommuteSetting = () => {
    feedback('toggle');
    onUpdateDailyAverage(commuteDistance);
    setIsEditingCommute(false);
  };

  const handleDelete = (id: string) => {
    feedback('alert');
    onDeleteLog(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Auto-Log and Stats */}
      <div className="bg-[#15191E] rounded-3xl text-white p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>ระบบจดบันทึกเลขไมล์อัตโนมัติ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              เลขไมล์ปัจจุบัน:{' '}
              <span className="text-blue-400">
                <AnimatedCounter value={bike.currentMileage} />
              </span>{' '}
              กม.
            </h2>
            <p className="text-xs text-slate-400">
              ค่าเฉลี่ยการขับขี่: <strong className="text-white">{bike.dailyAverageKm} กม./วัน</strong> • พยากรณ์เดือนนี้ ~{(bike.dailyAverageKm * 30).toLocaleString()} กม.
            </p>
          </div>

          {/* 1-Click Commute Button with tactile microinteraction */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              id="auto-commute-btn"
              onClick={handleAutoLogCommute}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95 touch-tactile"
            >
              <Navigation className="w-4 h-4 animate-bounce-subtle" />
              <span>+ บันทึกระยะทางประจำวัน ({commuteDistance} กม.)</span>
            </button>
            <button
              onClick={() => {
                feedback('tap');
                setIsEditingCommute(!isEditingCommute);
              }}
              className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700 transition cursor-pointer touch-tactile"
              title="ตั้งค่าระยะทางประจำวัน"
            >
              ⚙️ ตั้งค่า
            </button>
          </div>
        </div>

        {/* Commute Distance Editor */}
        {isEditingCommute && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-white block">กำหนดระยะทางเดินทางประจำวัน</span>
              <p className="text-[11px] text-slate-400">
                เช่น ระยะทางจากบ้านไปที่ทำงาน หรือสถานศึกษา ไป-กลับ รวมกี่กิโลเมตร
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="500"
                value={commuteDistance}
                onChange={(e) => setCommuteDistance(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold text-center focus:border-blue-500 outline-none"
              />
              <span className="text-xs text-slate-400">กม.</span>
              <button
                onClick={handleSaveCommuteSetting}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer active:scale-95 touch-tactile"
              >
                บันทึก
              </button>
            </div>
          </div>
        )}

        {justLoggedAlert && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in zoom-in-95">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 animate-in zoom-in-75 duration-200" />
            <span className="font-medium">{justLoggedAlert}</span>
          </div>
        )}
      </div>

      {/* Manual Input Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-[#15191E] rounded-3xl border border-slate-800 p-6 shadow-md">
          <h3 className="font-bold text-white text-base mb-4 pb-3 border-b border-slate-800 flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            <span>จดบันทึกเลขไมล์ด้วยตนเอง</span>
          </h3>

          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                เลขไมล์ใหม่บนหน้าปัด (กม.) *
              </label>
              <input
                type="number"
                required
                min={bike.currentMileage}
                value={newMileage}
                onChange={(e) => setNewMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg font-bold focus:border-blue-500 outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                ต้องมากกว่าหรือเท่ากับเลขไมล์เดิม ({bike.currentMileage.toLocaleString()} กม.)
              </span>
            </div>

            {/* Quick Mileage Bumpers with tactile audio ticks */}
            <div className="flex gap-2">
              {[15, 25, 50, 100].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleBumperClick(km)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-90 text-slate-300 text-xs font-mono font-semibold transition cursor-pointer touch-tactile"
                >
                  +{km}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">วันที่บันทึก *</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ประเภทการบันทึก</label>
              <select
                value={logType}
                onChange={(e) => {
                  feedback('tap');
                  setLogType(e.target.value as MileageLog['type']);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="manual">จดบันทึกตามหน้าปัด</option>
                <option value="daily_commute">เดินทางประจำวัน</option>
                <option value="refuel">บันทึกตอนเติมน้ำมัน</option>
                <option value="service">บันทึกตอนเข้าศูนย์/อู่</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">บันทึกหมายเหตุ</label>
              <input
                type="text"
                placeholder="เช่น ออกทริปกาญจนบุรี, ไปทำงาน"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer touch-tactile"
            >
              บันทึกเลขไมล์
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-7 bg-[#15191E] rounded-3xl border border-slate-800 p-6 shadow-md">
          <h3 className="font-bold text-white text-base mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
            <span>ประวัติการจดบันทึกเลขไมล์ ({currentLogs.length})</span>
            <span className="text-xs text-slate-400 font-normal">เรียงจากล่าสุด</span>
          </h3>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {currentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-850/60 dark:bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold font-mono text-white">
                      {log.mileage.toLocaleString()} กม.
                    </span>
                    {log.tripDistance && log.tripDistance > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/30">
                        +{log.tripDistance} กม.
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <span>{log.date}</span>
                    {log.note && <span> • {log.note}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-850 active:scale-90 transition cursor-pointer touch-tactile"
                  title="ลบรายการนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

