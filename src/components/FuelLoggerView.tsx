import React, { useState } from 'react';
import { MotorcycleProfile, FuelRecord } from '../types';
import { calculateFuelStats } from '../utils/calculations';
import { ConfirmationModal } from './ConfirmationModal';
import { feedback } from '../utils/feedback';
import {
  Fuel,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  Copy,
  Share2,
  Info,
  Check,
  Calendar,
  Building2,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface FuelLoggerViewProps {
  bike: MotorcycleProfile;
  fuelRecords: FuelRecord[];
  onAddFuelRecord: (record: Omit<FuelRecord, 'id'>) => void;
  onUpdateFuelRecord: (record: FuelRecord) => void;
  onDeleteFuelRecord: (id: string) => void;
}

const GAS_STATIONS = [
  'ปตท. (PTT Station)',
  'บางจาก (Bangchak)',
  'Shell (เชลล์)',
  'Caltex (คาลเท็กซ์)',
  'PT (พีที)',
  'Susco (ซัสโก้)',
  'Esso (เอสโซ่)',
  'อื่นๆ',
];

const FUEL_TYPES = [
  'แก๊สโซฮอล์ 95',
  'แก๊สโซฮอล์ 91',
  'แก๊สโซฮอล์ E20',
  'แก๊สโซฮอล์ E85',
  'เบนซิน 95',
  'ดีเซล',
];

export const FuelLoggerView: React.FC<FuelLoggerViewProps> = ({
  bike,
  fuelRecords,
  onAddFuelRecord,
  onUpdateFuelRecord,
  onDeleteFuelRecord,
}) => {
  const currentBikeRecords = fuelRecords
    .filter((r) => r.bikeId === bike.id || !r.bikeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = calculateFuelStats(currentBikeRecords);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FuelRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<FuelRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gasStation, setGasStation] = useState(GAS_STATIONS[0]);
  const [fuelType, setFuelType] = useState(FUEL_TYPES[0]);
  const [odometer, setOdometer] = useState<number>(bike.currentMileage);
  const [liters, setLiters] = useState<string>('4.5');
  const [pricePerLiter, setPricePerLiter] = useState<string>('38.50');
  const [totalCost, setTotalCost] = useState<string>('173.25');
  const [isFullTank, setIsFullTank] = useState(true);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setGasStation(GAS_STATIONS[0]);
    setFuelType(FUEL_TYPES[0]);
    setOdometer(bike.currentMileage);
    setLiters('4.5');
    setPricePerLiter('38.50');
    setTotalCost('173.25');
    setIsFullTank(true);
    setNotes('');
  };

  const openAddModal = () => {
    resetForm();
    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (rec: FuelRecord) => {
    setEditingRecord(rec);
    setDate(rec.date);
    setGasStation(rec.gasStation);
    setFuelType(rec.fuelType);
    setOdometer(rec.odometer);
    setLiters(String(rec.liters));
    setPricePerLiter(String(rec.pricePerLiter));
    setTotalCost(String(rec.totalCost));
    setIsFullTank(rec.isFullTank);
    setNotes(rec.notes || '');
    setIsAddModalOpen(true);
    setOpenMenuId(null);
  };

  // Handle auto cost calculations
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = parseFloat(val) || 0;
    const p = parseFloat(pricePerLiter) || 0;
    if (l > 0 && p > 0) setTotalCost((l * p).toFixed(2));
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const l = parseFloat(liters) || 0;
    const p = parseFloat(val) || 0;
    if (l > 0 && p > 0) setTotalCost((l * p).toFixed(2));
  };

  const handleTotalChange = (val: string) => {
    setTotalCost(val);
    const t = parseFloat(val) || 0;
    const p = parseFloat(pricePerLiter) || 0;
    if (t > 0 && p > 0) setLiters((t / p).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOdo = Number(odometer);
    const parsedLiters = parseFloat(liters) || 0;
    const parsedPrice = parseFloat(pricePerLiter) || 0;
    const parsedCost = parseFloat(totalCost) || 0;

    // Recalculate km/L
    let tripDist: number | undefined = undefined;
    let kmPerL: number | undefined = undefined;
    let costPerK: number | undefined = undefined;

    const previousRecord = currentBikeRecords.find(
      (r) => r.id !== editingRecord?.id && r.odometer < parsedOdo
    );

    if (previousRecord && parsedOdo > previousRecord.odometer) {
      tripDist = parsedOdo - previousRecord.odometer;
      if (parsedLiters > 0) {
        kmPerL = Math.round((tripDist / parsedLiters) * 10) / 10;
        costPerK = Math.round((parsedCost / tripDist) * 100) / 100;
      }
    }

    if (editingRecord) {
      // 30.2 UPDATE
      onUpdateFuelRecord({
        ...editingRecord,
        date,
        gasStation,
        fuelType,
        odometer: parsedOdo,
        liters: parsedLiters,
        pricePerLiter: parsedPrice,
        totalCost: parsedCost,
        isFullTank,
        tripDistance: tripDist || editingRecord.tripDistance,
        kmPerLiter: kmPerL || editingRecord.kmPerLiter,
        costPerKm: costPerK || editingRecord.costPerKm,
        notes,
      });
    } else {
      // 30.2 CREATE
      onAddFuelRecord({
        bikeId: bike.id,
        date,
        gasStation,
        fuelType,
        odometer: parsedOdo,
        liters: parsedLiters,
        pricePerLiter: parsedPrice,
        totalCost: parsedCost,
        isFullTank,
        tripDistance: tripDist,
        kmPerLiter: kmPerL,
        costPerKm: costPerK,
        notes,
      });
    }

    feedback('success');
    setIsAddModalOpen(false);
  };

  // Duplicate a fuel log (30.16)
  const handleDuplicate = (rec: FuelRecord) => {
    feedback('success');
    onAddFuelRecord({
      bikeId: bike.id,
      date: new Date().toISOString().split('T')[0],
      gasStation: rec.gasStation,
      fuelType: rec.fuelType,
      odometer: rec.odometer + 150,
      liters: rec.liters,
      pricePerLiter: rec.pricePerLiter,
      totalCost: rec.totalCost,
      isFullTank: rec.isFullTank,
      notes: `${rec.notes ? rec.notes + ' ' : ''}(สำเนา)`,
    });
    setOpenMenuId(null);
  };

  // Share / Copy summary (30.16)
  const handleShare = (rec: FuelRecord) => {
    feedback('success');
    const text = `⛽ เติมน้ำมัน ${rec.gasStation} (${rec.fuelType})\n📅 ${rec.date} ไมล์ ${rec.odometer.toLocaleString()} กม.\n💰 ฿${rec.totalCost} (${rec.liters} ลิตร @ ฿${rec.pricePerLiter})\n🚀 อัตราสิ้นเปลือง: ${rec.kmPerLiter ? rec.kmPerLiter + ' km/L' : '-'}`;
    navigator.clipboard.writeText(text);
    setOpenMenuId(null);
  };

  // Prepare chart data
  const chartData = [...currentBikeRecords]
    .reverse()
    .filter((r) => r.kmPerLiter && r.kmPerLiter > 0)
    .map((r) => ({
      date: r.date.slice(5),
      kmPerLiter: r.kmPerLiter,
      cost: r.totalCost,
    }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15191E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ระบบบันทึกน้ำมัน (Fuel Logger)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            แก้ไข ลบ ดูรายละเอียด และวิเคราะห์อัตราสิ้นเปลือง (km/L) รายครั้ง
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition cursor-pointer self-start sm:self-center shrink-0"
          title="บันทึกการเติมน้ำมัน (＋)"
          aria-label="บันทึกการเติมน้ำมัน"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">อัตราสิ้นเปลืองเฉลี่ย</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 dark:text-emerald-400">
              {stats.avgKmPerLiter}
            </span>
            <span className="text-xs text-slate-400">km/L</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1 block">
            {stats.avgKmPerLiter > 45 ? 'ประหยัดน้ำมันระดับดีเยี่ยม' : 'ระดับการสิ้นเปลืองปกติ'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">ต้นทุนต่อกิโลเมตร</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-500 dark:text-blue-400">
              ฿{stats.avgCostPerKm}
            </span>
            <span className="text-xs text-slate-400">/กม.</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">คำนวณจากระยะทางจริง</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">ค่าน้ำมันเดือนนี้</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              ฿{stats.monthSpent.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">{stats.monthLiters} ลิตร</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">บันทึกทั้งหมด</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {currentBikeRecords.length}
            </span>
            <span className="text-xs text-slate-400">ครั้ง</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">ยอดเงินสะสม ฿{stats.totalSpent.toLocaleString()}</span>
        </div>
      </div>

      {/* Fuel Consumption Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-[#15191E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                กราฟแนวโน้มอัตราสิ้นเปลือง (km/L)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ยิ่งสูงแปลว่ายิ่งประหยัดน้ำมัน</p>
            </div>
            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-mono font-semibold">
              เฉลี่ย {stats.avgKmPerLiter} km/L
            </span>
          </div>

          <div className="pt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val} km/L`, 'อัตราสิ้นเปลือง']}
                />
                <Line
                  type="monotone"
                  dataKey="kmPerLiter"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fuel Logs History List with 30.2 & 30.16 CRUD Buttons */}
      <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          ประวัติการเติมน้ำมัน ({currentBikeRecords.length} รายการ)
        </h3>

        {currentBikeRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            ยังไม่มีประวัติการเติมน้ำมัน คลิกปุ่มด้านบนเพื่อบันทึกครั้งแรก
          </div>
        ) : (
          <div className="space-y-3">
            {currentBikeRecords.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{r.gasStation}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-300 text-[10px] font-medium border border-slate-300 dark:border-slate-700">
                        {r.fuelType}
                      </span>
                      {r.isFullTank && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                          เต็มถัง
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      <span>{r.date}</span>
                      <span>•</span>
                      <span>ไมล์: {r.odometer.toLocaleString()} km</span>
                      <span>•</span>
                      <span>{r.liters} ลิตร (ลิตรละ ฿{r.pricePerLiter})</span>
                    </div>
                    {r.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{r.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right Actions & 30.16 Menu */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 self-stretch sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white block">
                      ฿{r.totalCost.toLocaleString()}
                    </span>
                    {r.kmPerLiter && (
                      <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 block">
                        {r.kmPerLiter} km/L ({r.tripDistance} กม.)
                      </span>
                    )}
                  </div>

                  {/* 30.16: View, Edit, Menu */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewingRecord(r)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="ดูรายละเอียด"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {/* 30.16: Action Buttons (34.2, 34.4 Icon-only actions) */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditModal(r)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="แก้ไขข้อมูลน้ำมัน (✏️)"
                        aria-label="แก้ไขข้อมูลน้ำมัน"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          setRecordToDelete(r);
                        }}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#EF4444]/20 text-[#EF4444] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="ลบรายการ (🗑️)"
                        aria-label="ลบรายการ"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      {/* 30.16: Menu (⋮) */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="เมนูตัวเลือก (⋮)"
                          aria-label="เมนูตัวเลือก"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === r.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 text-xs">
                              <button
                                onClick={() => openEditModal(r)}
                                className="w-full text-left p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                onClick={() => handleDuplicate(r)}
                                className="w-full text-left p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                              >
                                <Copy className="w-4 h-4 text-slate-400" />
                                <span>ทำสำเนา</span>
                              </button>
                              <button
                                onClick={() => handleShare(r)}
                                className="w-full text-left p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                              >
                                <Share2 className="w-4 h-4 text-emerald-400" />
                                <span>คัดลอกสรุป</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setRecordToDelete(r);
                                }}
                                className="w-full text-left p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition flex items-center space-x-2 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>ลบรายการ</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW FUEL RECORD DETAILS MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fuel className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">รายละเอียดการเติมน้ำมัน</h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ปั๊มน้ำมัน:</span>
                  <strong className="text-white">{viewingRecord.gasStation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ชนิดน้ำมัน:</span>
                  <strong className="text-blue-400">{viewingRecord.fuelType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">วันที่:</span>
                  <span className="text-slate-200 font-mono">{viewingRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เลขไมล์:</span>
                  <span className="text-slate-200 font-mono">{viewingRecord.odometer.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">จำนวนลิตร:</span>
                  <span className="text-slate-200 font-mono">{viewingRecord.liters} ลิตร</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ราคาต่อลิตร:</span>
                  <span className="text-slate-200 font-mono">฿{viewingRecord.pricePerLiter}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">ยอดเงินรวม:</span>
                  <strong className="text-lg font-mono text-white">฿{viewingRecord.totalCost.toLocaleString()}</strong>
                </div>
                {viewingRecord.kmPerLiter && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">อัตราสิ้นเปลือง:</span>
                    <strong className="text-emerald-400 font-mono">{viewingRecord.kmPerLiter} km/L</strong>
                  </div>
                )}
                {viewingRecord.costPerKm && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">ต้นทุนต่อกม.:</span>
                    <strong className="text-blue-400 font-mono">฿{viewingRecord.costPerKm} /km</strong>
                  </div>
                )}
              </div>

              {viewingRecord.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-slate-400 block mb-0.5">หมายเหตุ:</span>
                  {viewingRecord.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const rec = viewingRecord;
                  setViewingRecord(null);
                  openEditModal(rec);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                แก้ไขรายการ
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FUEL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fuel className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  {editingRecord ? 'แก้ไขข้อมูลการเติมน้ำมัน' : 'บันทึกการเติมน้ำมัน'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">วันที่ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">เลขไมล์หน้าปัด (กม.) *</label>
                  <input
                    type="number"
                    required
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ปั๊มน้ำมัน *</label>
                <select
                  value={gasStation}
                  onChange={(e) => setGasStation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  {GAS_STATIONS.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชนิดน้ำมัน *</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  {FUEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ราคา/ลิตร (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pricePerLiter}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">จำนวนลิตร</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liters}
                    onChange={(e) => handleLitersChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ยอดรวม (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalCost}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-full-tank"
                  checked={isFullTank}
                  onChange={(e) => setIsFullTank(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                />
                <label htmlFor="chk-full-tank" className="text-slate-300 cursor-pointer">
                  เติมเต็มถัง (ใช้คำนวณอัตราสิ้นเปลือง km/L ได้แม่นยำ)
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น เติมก่อนออกต่างจังหวัด ขี่นิ่งๆ"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {editingRecord ? 'บันทึกการแก้ไข' : 'บันทึกการเติมน้ำมัน'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 30.2 & 30.10 CONFIRM DELETE FUEL MODAL */}
      <ConfirmationModal
        isOpen={Boolean(recordToDelete)}
        title="ลบรายการเติมน้ำมัน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการเติมน้ำมันวันที่ ${recordToDelete?.date} (฿${recordToDelete?.totalCost})?`}
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onCancel={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            onDeleteFuelRecord(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
      />
    </div>
  );
};
