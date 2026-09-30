import React, { useState } from 'react';
import { MotorcycleProfile, ExpenseRecord, ExpenseCategory } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Lightbulb,
  Edit2,
  Trash2,
  MoreVertical,
  Copy,
  Share2,
  Plus,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface FinancialAnalyticsViewProps {
  bike: MotorcycleProfile;
  expenses: ExpenseRecord[];
  onAddExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
  onUpdateExpense: (record: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  fuel: 'น้ำมัน',
  oil: 'น้ำมันเครื่อง',
  repair: 'ซ่อม',
  parts: 'อะไหล่',
  service: 'เช็คระยะ/ค่าแรง',
  wash: 'ล้างรถ',
  tax: 'ภาษี',
  insurance: 'ประกัน',
  tire: 'ยาง & ช่วงล่าง',
  tax_insurance: 'ภาษี & พ.ร.บ.',
  accessories: 'ของแต่ง',
  other: 'อื่น ๆ',
};

export const FinancialAnalyticsView: React.FC<FinancialAnalyticsViewProps> = ({
  bike,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | 'all'>('6m');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('repair');
  const [formAmount, setFormAmount] = useState('500');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMileage, setFormMileage] = useState<number>(bike.currentMileage);
  const [formShopName, setFormShopName] = useState('ศูนย์บริการ / อู่ประจำ');
  const [formReceiptUrl, setFormReceiptUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const bikeExpenses = expenses
    .filter((e) => e.bikeId === bike.id || !e.bikeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group expenses by Month (YYYY-MM)
  const monthlyMap: Record<
    string,
    {
      month: string;
      fuel: number;
      oil: number;
      repair: number;
      other: number;
      total: number;
    }
  > = {};

  bikeExpenses.forEach((exp) => {
    const month = exp.date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[month]) {
      monthlyMap[month] = {
        month,
        fuel: 0,
        oil: 0,
        repair: 0,
        other: 0,
        total: 0,
      };
    }
    const cat = exp.category;
    if (cat === 'fuel') monthlyMap[month].fuel += exp.amount;
    else if (cat === 'oil') monthlyMap[month].oil += exp.amount;
    else if (cat === 'repair' || cat === 'parts' || cat === 'service' || cat === 'tire')
      monthlyMap[month].repair += exp.amount;
    else monthlyMap[month].other += exp.amount;

    monthlyMap[month].total += exp.amount;
  });

  const sortedMonths = Object.keys(monthlyMap).sort();
  const rawChartData = sortedMonths.map((m) => {
    const d = monthlyMap[m];
    const [y, mon] = m.split('-');
    const thaiMonths = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const label = `${thaiMonths[parseInt(mon, 10)]} ${parseInt(y, 10) + 543 - 2500}`;
    return {
      monthKey: m,
      monthLabel: label,
      'ค่าน้ำมัน': d.fuel,
      'น้ำมันเครื่อง': d.oil,
      'ซ่อม & อะไหล่': d.repair,
      'ภาษี/ประกัน/อื่นๆ': d.other,
      total: d.total,
    };
  });

  const chartData = timeframe === '6m' ? rawChartData.slice(-6) : rawChartData;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  bikeExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    grandTotal += e.amount;
  });

  const totalCostPerKm =
    bike.currentMileage > 0 ? (grandTotal / bike.currentMileage).toFixed(2) : '0.00';

  // Current month vs Last month
  const now = new Date();
  const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const curMonthTotal = monthlyMap[curMonthKey]?.total || 0;
  const prevMonthTotal = monthlyMap[prevMonthKey]?.total || 0;
  const diffMonth = curMonthTotal - prevMonthTotal;
  const pctDiff =
    prevMonthTotal > 0 ? Math.round((Math.abs(diffMonth) / prevMonthTotal) * 100) : 0;

  // Filtered expenses list
  const filteredExpenses = bikeExpenses.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.title.toLowerCase().includes(term) ||
      (e.shopName && e.shopName.toLowerCase().includes(term)) ||
      (e.notes && e.notes.toLowerCase().includes(term))
    );
  });

  const openEditModal = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormDate(exp.date);
    setFormMileage(exp.mileage);
    setFormShopName(exp.shopName || '');
    setFormReceiptUrl(exp.receiptUrl || '');
    setFormNotes(exp.notes || '');
    setIsAddModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDuplicate = (exp: ExpenseRecord) => {
    onAddExpense({
      bikeId: bike.id,
      title: `${exp.title} (สำเนา)`,
      category: exp.category,
      amount: exp.amount,
      mileage: bike.currentMileage,
      date: new Date().toISOString().split('T')[0],
      shopName: exp.shopName,
      receiptUrl: exp.receiptUrl,
      notes: exp.notes,
    });
    setOpenMenuId(null);
  };

  const handleShare = (exp: ExpenseRecord) => {
    const text = `💰 บันทึกค่าใช้จ่าย: ${exp.title}\n📅 ${exp.date} ยอดเงิน ฿${exp.amount.toLocaleString()}\nหมวดหมู่: ${CATEGORY_NAMES[exp.category] || exp.category}\nสถานที่: ${exp.shopName || '-'}`;
    navigator.clipboard.writeText(text);
    alert('คัดลอกข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว');
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        title: formTitle,
        category: formCategory,
        amount: Number(formAmount) || 0,
        date: formDate,
        mileage: Number(formMileage) || bike.currentMileage,
        shopName: formShopName,
        receiptUrl: formReceiptUrl,
        notes: formNotes,
      });
    } else {
      onAddExpense({
        bikeId: bike.id,
        title: formTitle,
        category: formCategory,
        amount: Number(formAmount) || 0,
        date: formDate,
        mileage: Number(formMileage) || bike.currentMileage,
        shopName: formShopName,
        receiptUrl: formReceiptUrl,
        notes: formNotes,
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
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ค่าใช้จ่าย & การวางแผนการเงิน
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            แก้ไข ลบ ดูรายละเอียด สรุปค่าใช้จ่ายแยกหมวดหมู่ และกราฟแนวโน้มรายเดือน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => {
              setEditingExpense(null);
              setFormTitle('');
              setFormCategory('repair');
              setFormAmount('450');
              setFormDate(new Date().toISOString().split('T')[0]);
              setFormMileage(bike.currentMileage);
              setFormShopName('');
              setFormNotes('');
              setIsAddModalOpen(true);
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0"
            title="เพิ่มค่าใช้จ่าย (＋)"
            aria-label="เพิ่มค่าใช้จ่าย"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">ค่าใช้จ่ายรวมทั้งหมด</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              ฿{grandTotal.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">จาก {bikeExpenses.length} บิล</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">ค่าใช้จ่ายเดือนนี้</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-500 dark:text-blue-400">
              ฿{curMonthTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] mt-1">
            {diffMonth > 0 ? (
              <span className="text-rose-500 dark:text-rose-400 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{pctDiff}% จากเดือนก่อน
              </span>
            ) : diffMonth < 0 ? (
              <span className="text-emerald-500 dark:text-emerald-400 font-medium flex items-center">
                <ArrowDownRight className="w-3 h-3" /> -{pctDiff}% จากเดือนก่อน
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">เท่ากับเดือนก่อน</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">ต้นทุนการดูแลต่อกิโลเมตร</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 dark:text-emerald-400">
              ฿{totalCostPerKm}
            </span>
            <span className="text-xs text-slate-400">/กม.</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">คิดจากเลขไมล์ทั้งหมด</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">งบแนะนำต่อเดือน</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              ฿{Math.round(grandTotal / Math.max(1, sortedMonths.length) || 800).toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-blue-500 dark:text-blue-400 mt-1 block">สำรองงบสำหรับซ่อมบำรุง</span>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white dark:bg-[#15191E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              กราฟแนวโน้มค่าใช้จ่ายรายเดือน (Monthly Expenses Trend)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">แยกตามประเภทน้ำมัน น้ำมันเครื่อง อะไหล่ และเอกสาร</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeframe('6m')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition cursor-pointer ${
                timeframe === '6m' ? 'bg-[#1677FF] text-white shadow-xs' : 'text-[#A7ADB5] hover:text-white'
              }`}
              title="สถิติย้อนหลัง 6 เดือน (📅)"
              aria-label="สถิติย้อนหลัง 6 เดือน"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition cursor-pointer ${
                timeframe === 'all' ? 'bg-[#1677FF] text-white shadow-xs' : 'text-[#A7ADB5] hover:text-white'
              }`}
              title="สถิติทั้งหมดทุกช่วงเวลา (📊)"
              aria-label="สถิติทั้งหมดทุกช่วงเวลา"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="pt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [`฿${val.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="ค่าน้ำมัน" fill="#3b82f6" stackId="a" />
              <Bar dataKey="น้ำมันเครื่อง" fill="#f59e0b" stackId="a" />
              <Bar dataKey="ซ่อม & อะไหล่" fill="#ef4444" stackId="a" />
              <Bar dataKey="ภาษี/ประกัน/อื่นๆ" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30.3 & 30.16 EXPENSE MANAGEMENT LIST (CRUD) */}
      <div className="bg-[#15191E] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">
              รายการค่าใช้จ่ายทั้งหมด ({bikeExpenses.length})
            </h3>
            <p className="text-xs text-slate-400">แก้ไขข้อมูล ลบ ทำสำเนา และดูใบเสร็จ</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อรายการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="fuel">น้ำมัน</option>
              <option value="oil">น้ำมันเครื่อง</option>
              <option value="repair">ซ่อม</option>
              <option value="parts">อะไหล่</option>
              <option value="wash">ล้างรถ</option>
              <option value="tax">ภาษี</option>
              <option value="insurance">ประกัน</option>
              <option value="other">อื่น ๆ</option>
            </select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-2.5">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              ไม่พบรายการค่าใช้จ่าย
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl bg-slate-850/60 dark:bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 text-[10px] font-semibold border border-slate-700">
                      {CATEGORY_NAMES[exp.category] || exp.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span>ไมล์: {exp.mileage.toLocaleString()} km</span>
                    {exp.shopName && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-sans">{exp.shopName}</span>
                      </>
                    )}
                  </div>
                  {exp.notes && (
                    <p className="text-[11px] text-slate-400 mt-1">{exp.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 self-stretch sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-base font-bold font-mono text-white">
                    ฿{exp.amount.toLocaleString()}
                  </span>

                  {/* 30.16 Action Buttons (34.2, 34.4 Icon-only actions) */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(exp)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-[#1677FF] flex items-center justify-center transition cursor-pointer shrink-0"
                      title="แก้ไขค่าใช้จ่าย (✏️)"
                      aria-label="แก้ไขค่าใช้จ่าย"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        setExpenseToDelete(exp);
                      }}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/80 hover:bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center transition cursor-pointer shrink-0"
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
            ))
          )}
        </div>
      </div>

      {/* EDIT / ADD EXPENSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingExpense ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่าย'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อรายการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ถ่ายน้ำมันเครื่อง, ล้างโซ่, ผ้าเบรก"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">หมวดหมู่ *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="fuel">น้ำมัน</option>
                    <option value="oil">น้ำมันเครื่อง</option>
                    <option value="repair">ซ่อม</option>
                    <option value="parts">อะไหล่</option>
                    <option value="service">เช็คระยะ/ค่าแรง</option>
                    <option value="wash">ล้างรถ</option>
                    <option value="tax">ภาษี</option>
                    <option value="insurance">ประกัน</option>
                    <option value="tire">ยาง & ช่วงล่าง</option>
                    <option value="accessories">ของแต่ง</option>
                    <option value="other">อื่น ๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">จำนวนเงิน (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">วันที่ทำรายการ *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">เลขไมล์ (กม.) *</label>
                  <input
                    type="number"
                    required
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ร้านค้า / อู่บริการ</label>
                <input
                  type="text"
                  placeholder="เช่น ศูนย์ฮอนด้า พระราม 9"
                  value={formShopName}
                  onChange={(e) => setFormShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">รูปใบเสร็จ (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formReceiptUrl}
                  onChange={(e) => setFormReceiptUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุ</label>
                <textarea
                  rows={2}
                  placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {editingExpense ? 'บันทึกการแก้ไข' : 'บันทึกค่าใช้จ่าย'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 30.10 CONFIRM DELETE EXPENSE MODAL */}
      <ConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        title="ลบรายการค่าใช้จ่าย"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${expenseToDelete?.title}" (฿${expenseToDelete?.amount.toLocaleString()})? ยอดรวมค่าใช้จ่ายและกราฟจะถูกคำนวณใหม่ทันที`}
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
