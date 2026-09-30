import React, { useState } from 'react';
import { MotorcycleProfile, ExpenseRecord, ExpenseCategory } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import {
  Wrench,
  Search,
  Plus,
  Sparkles,
  Calendar,
  Building2,
  DollarSign,
  Tag,
  Trash2,
  Edit2,
  MoreVertical,
  Copy,
  Share2,
  Info,
  Image,
} from 'lucide-react';

interface RepairHistoryViewProps {
  bike: MotorcycleProfile;
  expenses: ExpenseRecord[];
  onAddRepairExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
  onUpdateRepairExpense: (record: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  onAskAI: (prompt: string) => void;
}

export const RepairHistoryView: React.FC<RepairHistoryViewProps> = ({
  bike,
  expenses,
  onAddRepairExpense,
  onUpdateRepairExpense,
  onDeleteExpense,
  onAskAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'repair' | 'oil' | 'tire' | 'service'>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form states with 30.4: laborCost + partsCost
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('repair');
  const [laborCost, setLaborCost] = useState('150');
  const [partsCost, setPartsCost] = useState('300');
  const [totalAmount, setTotalAmount] = useState('450');
  const [mileage, setMileage] = useState(bike.currentMileage);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopName, setShopName] = useState('ศูนย์บริการฮอนด้า / อู่ช่างเอก');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');

  const bikeExpenses = expenses
    .filter((e) => e.bikeId === bike.id || !e.bikeId)
    .filter((e) => e.category === 'repair' || e.category === 'oil' || e.category === 'service' || e.category === 'tire' || e.category === 'accessories' || e.category === 'parts');

  const filteredExpenses = bikeExpenses
    .filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.title.toLowerCase().includes(term) ||
        (e.shopName && e.shopName.toLowerCase().includes(term)) ||
        (e.notes && e.notes.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Auto calculate total = labor + parts
  const handleLaborChange = (val: string) => {
    setLaborCost(val);
    const l = parseFloat(val) || 0;
    const p = parseFloat(partsCost) || 0;
    setTotalAmount(String(l + p));
  };

  const handlePartsChange = (val: string) => {
    setPartsCost(val);
    const l = parseFloat(laborCost) || 0;
    const p = parseFloat(val) || 0;
    setTotalAmount(String(l + p));
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('repair');
    setLaborCost('150');
    setPartsCost('350');
    setTotalAmount('500');
    setMileage(bike.currentMileage);
    setDate(new Date().toISOString().split('T')[0]);
    setShopName('อู่ช่างเอก รามคำแหง');
    setReceiptUrl('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    const l = exp.laborCost !== undefined ? String(exp.laborCost) : '0';
    const p = exp.partsCost !== undefined ? String(exp.partsCost) : String(exp.amount);
    setLaborCost(l);
    setPartsCost(p);
    setTotalAmount(String(exp.amount));
    setMileage(exp.mileage);
    setDate(exp.date);
    setShopName(exp.shopName || '');
    setReceiptUrl(exp.receiptUrl || '');
    setNotes(exp.notes || '');
    setIsAddModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDuplicate = (exp: ExpenseRecord) => {
    onAddRepairExpense({
      bikeId: bike.id,
      title: `${exp.title} (สำเนา)`,
      category: exp.category,
      amount: exp.amount,
      laborCost: exp.laborCost,
      partsCost: exp.partsCost,
      mileage: bike.currentMileage,
      date: new Date().toISOString().split('T')[0],
      shopName: exp.shopName,
      receiptUrl: exp.receiptUrl,
      notes: exp.notes,
    });
    setOpenMenuId(null);
  };

  const handleShare = (exp: ExpenseRecord) => {
    const text = `🔧 ประวัติการซ่อม: ${exp.title}\n📅 วันที่: ${exp.date} (ไมล์ ${exp.mileage.toLocaleString()} km)\n💰 ค่าใช้จ่ายรวม: ฿${exp.amount.toLocaleString()} (ค่าแรง: ฿${exp.laborCost || 0} + ค่าอะไหล่: ฿${exp.partsCost || exp.amount})\n🏠 ร้าน: ${exp.shopName || '-'}`;
    navigator.clipboard.writeText(text);
    alert('คัดลอกข้อมูลสรุปการซ่อมเรียบร้อยแล้ว');
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedLabor = parseFloat(laborCost) || 0;
    const parsedParts = parseFloat(partsCost) || 0;
    const parsedTotal = parseFloat(totalAmount) || parsedLabor + parsedParts;

    if (editingExpense) {
      // 30.4 UPDATE
      onUpdateRepairExpense({
        ...editingExpense,
        title,
        category,
        amount: parsedTotal,
        laborCost: parsedLabor,
        partsCost: parsedParts,
        mileage: Number(mileage) || bike.currentMileage,
        date,
        shopName,
        receiptUrl,
        notes,
      });
    } else {
      // 30.4 CREATE
      onAddRepairExpense({
        bikeId: bike.id,
        title,
        category,
        amount: parsedTotal,
        laborCost: parsedLabor,
        partsCost: parsedParts,
        mileage: Number(mileage) || bike.currentMileage,
        date,
        shopName,
        receiptUrl,
        notes,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15191E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[#1677FF] border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              สรุปประวัติการซ่อมบำรุง & ร้านซ่อม
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            แก้ไข ลบ ดูรายละเอียด แยกคำนวณค่าแรง + ค่าอะไหล่ และบันทึกรูปใบเสร็จ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() =>
              onAskAI(
                `ช่วยวิเคราะห์ประวัติการซ่อมและบำรุงรักษาของรถ ${bike.name} ปี ${bike.year} เลขไมล์ ${bike.currentMileage} กม. จากรายการทั้งหมด ${bikeExpenses.length} ครั้งให้หน่อยครับ ว่ามีส่วนไหนที่ต้องระวังเป็นพิเศษหรือไม่?`
              )
            }
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-amber-400 border border-blue-500/40 flex items-center justify-center transition cursor-pointer shrink-0"
            title="ปรึกษาช่าง AI"
            aria-label="ปรึกษาช่าง AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={openAddModal}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0"
            title="บันทึกการซ่อม (＋)"
            aria-label="บันทึกการซ่อม"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 dark:bg-[#15191E]/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออะไหล่ ร้านซ่อม หรืออาการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setCategoryFilter('repair')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'repair'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ซ่อม & อะไหล่
          </button>
          <button
            onClick={() => setCategoryFilter('oil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'oil'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            น้ำมันเครื่อง
          </button>
          <button
            onClick={() => setCategoryFilter('tire')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'tire'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ยาง & ล้อ
          </button>
        </div>
      </div>

      {/* History List with 30.4 & 30.16 Action Buttons */}
      <div className="bg-white dark:bg-[#15191E] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            พบ {filteredExpenses.length} รายการ (รวม ฿{totalSpent.toLocaleString()})
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            เลขไมล์ปัจจุบัน: <strong className="text-slate-900 dark:text-white">{bike.currentMileage.toLocaleString()} km</strong>
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            ไม่พบประวัติการซ่อมบำรุงที่ตรงกับเงื่อนไขค้นหา
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0 mt-0.5">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{exp.title}</h4>
                      {exp.isOilChange && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
                          ถ่ายน้ำมันเครื่อง
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span>เลขไมล์: {exp.mileage.toLocaleString()} km</span>
                      {exp.shopName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 dark:text-slate-300 font-sans">{exp.shopName}</span>
                        </>
                      )}
                    </div>

                    {/* Breakdown of Labor + Parts */}
                    {(exp.laborCost !== undefined || exp.partsCost !== undefined) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>ค่าแรง: ฿{exp.laborCost || 0}</span>
                        <span>+</span>
                        <span>ค่าอะไหล่: ฿{exp.partsCost || exp.amount}</span>
                      </div>
                    )}

                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {exp.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 self-stretch sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white block">
                      ฿{exp.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">รวมค่าแรง & อะไหล่</span>
                  </div>

                  {/* 30.16: Action Buttons (34.2, 34.4 Icon-only actions) */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setViewingExpense(exp)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="ดูรายละเอียดข้อมูลการซ่อม"
                      aria-label="ดูรายละเอียดข้อมูลการซ่อม"
                    >
                      <Info className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => openEditModal(exp)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="แก้ไขประวัติการซ่อม (✏️)"
                      aria-label="แก้ไขประวัติการซ่อม"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        setExpenseToDelete(exp);
                      }}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#EF4444]/20 text-[#EF4444] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="ลบรายการ (🗑️)"
                      aria-label="ลบรายการ"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* ⋮ Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === exp.id ? null : exp.id)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-[#A7ADB5] hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                        title="เมนูเพิ่มเติม (⋮)"
                        aria-label="เมนูเพิ่มเติม"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === exp.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 text-xs">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="w-full text-left p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              onClick={() => handleDuplicate(exp)}
                              className="w-full text-left p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Copy className="w-4 h-4 text-slate-400" />
                              <span>ทำสำเนา</span>
                            </button>
                            <button
                              onClick={() => handleShare(exp)}
                              className="w-full text-left p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 text-emerald-400" />
                              <span>คัดลอกสรุป</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setExpenseToDelete(exp);
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
            ))}
          </div>
        )}
      </div>

      {/* VIEW REPAIR DETAIL MODAL */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">รายละเอียดการซ่อมบำรุง</h3>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">รายการ:</span>
                  <strong className="text-white">{viewingExpense.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">วันที่:</span>
                  <span className="text-slate-200 font-mono">{viewingExpense.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เลขไมล์:</span>
                  <span className="text-slate-200 font-mono">{viewingExpense.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ร้าน / ศูนย์:</span>
                  <span className="text-slate-200">{viewingExpense.shopName || '-'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">ค่าแรง:</span>
                  <span className="font-mono text-slate-200">฿{viewingExpense.laborCost || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ค่าอะไหล่:</span>
                  <span className="font-mono text-slate-200">฿{viewingExpense.partsCost || viewingExpense.amount}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400 font-bold">ค่าใช้จ่ายรวม:</span>
                  <strong className="text-lg font-mono text-white">฿{viewingExpense.amount.toLocaleString()}</strong>
                </div>
              </div>

              {viewingExpense.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-slate-400 block mb-0.5">หมายเหตุ:</span>
                  {viewingExpense.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const exp = viewingExpense;
                  setViewingExpense(null);
                  openEditModal(exp);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                แก้ไขรายการ
              </button>
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT REPAIR MODAL WITH 30.4 (ค่าแรง + ค่าอะไหล่) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingExpense ? 'แก้ไขข้อมูลการซ่อม' : 'บันทึกประวัติการซ่อมบำรุง'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  รายการซ่อม / อะไหล่ที่เปลี่ยน *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เปลี่ยนถ่ายน้ำมันเครื่อง + ผ้าเบรกหน้า"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              {/* 30.4: ค่าแรง + ค่าอะไหล่ = ค่าใช้จ่ายรวม */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-semibold text-blue-400 block">
                  คำนวณค่าใช้จ่าย: รวม = ค่าแรง + ค่าอะไหล่
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ค่าแรง (บาท)</label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => handleLaborChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ค่าอะไหล่ (บาท)</label>
                    <input
                      type="number"
                      value={partsCost}
                      onChange={(e) => handlePartsChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ค่าใช้จ่ายรวม (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-blue-500/50 text-white font-mono font-bold text-base focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

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
                  <label className="block text-slate-300 font-semibold mb-1">เลขไมล์ (กม.) *</label>
                  <input
                    type="number"
                    required
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ร้านซ่อม / ศูนย์บริการ</label>
                <input
                  type="text"
                  placeholder="เช่น อู่ช่างเอก รามคำแหง"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">รูปภาพ / รูปใบเสร็จ (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุ / อะไหล่ที่ใช้</label>
                <textarea
                  rows={2}
                  placeholder="บันทึกยี่ห้ออะไหล่ หรือคำแนะนำของช่าง"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                {editingExpense ? 'บันทึกการแก้ไข' : 'บันทึกประวัติการซ่อม'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 30.10 CONFIRM DELETE REPAIR MODAL */}
      <ConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        title="ลบรายการซ่อมบำรุง"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการซ่อม "${expenseToDelete?.title}" วันที่ ${expenseToDelete?.date} (฿${expenseToDelete?.amount.toLocaleString()})?`}
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onCancel={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
      />
    </div>
  );
};
