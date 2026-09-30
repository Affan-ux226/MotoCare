import React, { useState } from 'react';
import { MotorcycleProfile, ExpenseCategory, FuelRecord, ExpenseRecord } from '../types';
import { Fuel, Droplet, Wrench, DollarSign, PlusCircle } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface QuickAddModalProps {
  bike: MotorcycleProfile;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'fuel' | 'oil' | 'service' | 'expense';
  onAddFuelRecord: (record: Omit<FuelRecord, 'id'>) => void;
  onRecordOilChange: (record: {
    mileage: number;
    date: string;
    amount: number;
    oilType: string;
    shopName: string;
    notes: string;
  }) => void;
  onAddExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  bike,
  isOpen,
  onClose,
  defaultTab = 'fuel',
  onAddFuelRecord,
  onRecordOilChange,
  onAddExpense,
}) => {
  const [activeType, setActiveType] = useState<'fuel' | 'oil' | 'service' | 'expense'>(defaultTab);

  // Common fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState(bike.currentMileage);

  // Fuel fields
  const [fuelStation, setFuelStation] = useState('ปตท. (PTT Station)');
  const [fuelType, setFuelType] = useState('แก๊สโซฮอล์ 95');
  const [liters, setLiters] = useState('4.5');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('38.50');
  const [fuelTotal, setFuelTotal] = useState('173.25');

  // Oil change fields
  const [oilAmount, setOilAmount] = useState('420');
  const [oilGrade, setOilGrade] = useState(bike.recommendedOilGrade);
  const [oilShop, setOilShop] = useState('ศูนย์บริการฮอนด้า / อู่ประจำ');

  // Service & Expense fields
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('repair');
  const [expenseAmount, setExpenseAmount] = useState('450');
  const [expenseShop, setExpenseShop] = useState('ศูนย์บริการ / อู่ประจำ');
  const [expenseNotes, setExpenseNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedback('success');

    if (activeType === 'fuel') {
      const parsedL = parseFloat(liters) || 0;
      const parsedCost = parseFloat(fuelTotal) || 0;
      onAddFuelRecord({
        bikeId: bike.id,
        date,
        gasStation: fuelStation,
        fuelType,
        liters: parsedL,
        pricePerLiter: parseFloat(fuelPricePerLiter) || 0,
        totalCost: parsedCost,
        odometer: Number(mileage),
        isFullTank: true,
      });
    } else if (activeType === 'oil') {
      onRecordOilChange({
        mileage: Number(mileage),
        date,
        amount: Number(oilAmount) || 0,
        oilType: oilGrade,
        shopName: oilShop,
        notes: `ถ่ายน้ำมันเครื่องเกรด ${oilGrade}`,
      });
    } else {
      onAddExpense({
        bikeId: bike.id,
        title: expenseTitle || (activeType === 'service' ? 'เช็คระยะและเปลี่ยนอะไหล่' : 'ค่าใช้จ่ายทั่วไป'),
        category: activeType === 'service' ? 'service' : expenseCategory,
        amount: Number(expenseAmount) || 0,
        mileage: Number(mileage),
        date,
        shopName: expenseShop,
        notes: expenseNotes,
      });
    }

    onClose();
  };

  const handleTabChange = (type: 'fuel' | 'oil' | 'service' | 'expense') => {
    feedback('tap');
    setActiveType(type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">เพิ่มรายการด่วน</h3>
          </div>
          <button
            onClick={() => {
              feedback('tap');
              onClose();
            }}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer active:scale-90 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('fuel')}
            className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer active:scale-95 touch-tactile ${
              activeType === 'fuel'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span className="text-[11px]">เติมน้ำมัน</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('oil')}
            className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer active:scale-95 touch-tactile ${
              activeType === 'oil'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span className="text-[11px]">น้ำมันเครื่อง</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('service')}
            className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer active:scale-95 touch-tactile ${
              activeType === 'service'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="text-[11px]">ซ่อม/อะไหล่</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('expense')}
            className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer active:scale-95 touch-tactile ${
              activeType === 'expense'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[11px]">ค่าใช้จ่าย</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">วันที่ทำรายการ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">เลขไมล์ปัจจุบัน (กม.) *</label>
              <input
                type="number"
                required
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* FUEL FIELDS */}
          {activeType === 'fuel' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ปั๊มน้ำมัน</label>
                <select
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="ปตท. (PTT Station)">ปตท. (PTT Station)</option>
                  <option value="บางจาก (Bangchak)">บางจาก (Bangchak)</option>
                  <option value="Shell (เชลล์)">Shell (เชลล์)</option>
                  <option value="Caltex (คาลเท็กซ์)">Caltex (คาลเท็กซ์)</option>
                  <option value="PT (พีที)">PT (พีที)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชนิดน้ำมัน</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="แก๊สโซฮอล์ 95">แก๊สโซฮอล์ 95</option>
                  <option value="แก๊สโซฮอล์ 91">แก๊สโซฮอล์ 91</option>
                  <option value="แก๊สโซฮอล์ E20">แก๊สโซฮอล์ E20</option>
                  <option value="เบนซิน 95">เบนซิน 95</option>
                  <option value="ดีเซล">ดีเซล</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">จำนวนลิตร</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liters}
                    onChange={(e) => {
                      setLiters(e.target.value);
                      const l = parseFloat(e.target.value) || 0;
                      const p = parseFloat(fuelPricePerLiter) || 0;
                      if (l > 0 && p > 0) setFuelTotal((l * p).toFixed(2));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ราคารวม (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fuelTotal}
                    onChange={(e) => setFuelTotal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* OIL FIELDS */}
          {activeType === 'oil' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">เกรดน้ำมันเครื่อง</label>
                <input
                  type="text"
                  required
                  value={oilGrade}
                  onChange={(e) => setOilGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ค่าใช้จ่าย (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={oilAmount}
                    onChange={(e) => setOilAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ร้าน / ศูนย์บริการ</label>
                  <input
                    type="text"
                    value={oilShop}
                    onChange={(e) => setOilShop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* SERVICE & EXPENSE FIELDS */}
          {(activeType === 'service' || activeType === 'expense') && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อรายการ / สิ่งที่ทำ *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeType === 'service'
                      ? 'เช่น เปลี่ยนผ้าเบรกหน้าแท้ + ล้างโซ่'
                      : 'เช่น กระจกแต่งปลายแฮนด์, ล้างเคลือบสี'
                  }
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ยอดเงิน (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ร้านซ่อม / สถานที่</label>
                  <input
                    type="text"
                    value={expenseShop}
                    onChange={(e) => setExpenseShop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น อะไหล่แท้เบิกศูนย์ รับประกัน 6 เดือน"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
