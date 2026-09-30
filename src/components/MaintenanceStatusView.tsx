import React, { useState } from 'react';
import {
  MotorcycleProfile,
  MaintenanceItem,
  MaintenanceComponentType,
  ExpenseCategory,
} from '../types';
import { calculateItemHealth, ItemHealthStatus } from '../utils/calculations';
import { ConfirmationModal } from './ConfirmationModal';
import { feedback } from '../utils/feedback';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  Droplet,
  Disc,
  CircleDot,
  Radio,
  Battery,
  Flame,
  Wind,
  Check,
  ChevronRight,
  Info,
  Edit2,
  Trash2,
  MoreVertical,
  Copy,
  Share2,
} from 'lucide-react';

interface MaintenanceStatusViewProps {
  bike: MotorcycleProfile;
  items: MaintenanceItem[];
  onServiceItem: (
    itemId: string,
    cost: number,
    shopName: string,
    notes: string,
    odometer: number
  ) => void;
  onAddItem: (item: Omit<MaintenanceItem, 'id'>) => void;
  onUpdateItem: (item: MaintenanceItem) => void;
  onDeleteItem: (id: string) => void;
  onAskAI: (prompt: string) => void;
  selectedItemModal?: MaintenanceItem | null;
  onCloseItemModal?: () => void;
}

export const MaintenanceStatusView: React.FC<MaintenanceStatusViewProps> = ({
  bike,
  items,
  onServiceItem,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAskAI,
  selectedItemModal,
  onCloseItemModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  const [activeItemDetail, setActiveItemDetail] = useState<MaintenanceItem | null>(
    selectedItemModal || null
  );

  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceTargetItem, setServiceTargetItem] = useState<MaintenanceItem | null>(null);
  const [serviceCost, setServiceCost] = useState('350');
  const [serviceShop, setServiceShop] = useState('ศูนย์บริการ / อู่ประจำ');
  const [serviceNotes, setServiceNotes] = useState('');
  const [serviceOdometer, setServiceOdometer] = useState(bike.currentMileage);

  // 30.5 Edit Part / Checklist Item Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MaintenanceItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Edit / Add Item Form fields (30.5)
  const [formThaiName, setFormThaiName] = useState('');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCost, setFormCost] = useState('350');
  const [formInstalledMileage, setFormInstalledMileage] = useState<number>(bike.currentMileage);
  const [formInstalledDate, setFormInstalledDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIntervalKm, setFormIntervalKm] = useState('10000');
  const [formIntervalMonths, setFormIntervalMonths] = useState('12');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formComponentType, setFormComponentType] = useState<MaintenanceComponentType>('custom');

  // Filter items for current bike
  const currentBikeItems = items.filter((i) => i.bikeId === bike.id || !i.bikeId);

  const healthList: ItemHealthStatus[] = currentBikeItems.map((item) =>
    calculateItemHealth(item, bike.currentMileage, bike.dailyAverageKm)
  );

  const overdueCount = healthList.filter((h) => h.urgency === 'overdue').length;
  const dueSoonCount = healthList.filter((h) => h.urgency === 'due_soon').length;

  const filteredList = healthList.filter((h) => {
    if (filter === 'urgent') return h.urgency !== 'normal';
    if (filter === 'normal') return h.urgency === 'normal';
    return true;
  });

  const getComponentIcon = (type: MaintenanceComponentType) => {
    switch (type) {
      case 'engine_oil':
        return <Droplet className="w-5 h-5 text-blue-400 fill-blue-400" />;
      case 'brake_pads':
        return <Disc className="w-5 h-5 text-amber-400" />;
      case 'tires':
        return <CircleDot className="w-5 h-5 text-slate-300" />;
      case 'brake_fluid':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'coolant':
        return <Droplet className="w-5 h-5 text-emerald-400" />;
      case 'chain_belt':
        return <Radio className="w-5 h-5 text-purple-400" />;
      case 'battery':
        return <Battery className="w-5 h-5 text-yellow-400" />;
      case 'spark_plug':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'air_filter':
        return <Wind className="w-5 h-5 text-teal-400" />;
      default:
        return <Wrench className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleOpenServiceModal = (item: MaintenanceItem) => {
    setServiceTargetItem(item);
    setServiceCost(String(item.cost || 350));
    setServiceNotes(`เปลี่ยน/ตรวจเช็ค: ${item.thaiName}`);
    setServiceOdometer(bike.currentMileage);
    setIsServiceModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTargetItem) return;
    feedback('success');
    onServiceItem(
      serviceTargetItem.id,
      Number(serviceCost) || 0,
      serviceShop,
      serviceNotes,
      Number(serviceOdometer) || bike.currentMileage
    );
    setIsServiceModalOpen(false);
    setActiveItemDetail(null);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormThaiName('');
    setFormName('');
    setFormBrand('');
    setFormModel('');
    setFormCost('350');
    setFormInstalledMileage(bike.currentMileage);
    setFormInstalledDate(new Date().toISOString().split('T')[0]);
    setFormIntervalKm('10000');
    setFormIntervalMonths('12');
    setFormDescription('');
    setFormNotes('');
    setFormComponentType('custom');
    setIsEditModalOpen(true);
  };

  const openEditModal = (item: MaintenanceItem) => {
    setEditingItem(item);
    setFormThaiName(item.thaiName);
    setFormName(item.name);
    setFormBrand(item.brand || '');
    setFormModel(item.model || '');
    setFormCost(String(item.cost || 350));
    setFormInstalledMileage(item.lastServiceMileage);
    setFormInstalledDate(item.lastServiceDate);
    setFormIntervalKm(String(item.intervalKm));
    setFormIntervalMonths(String(item.intervalMonths));
    setFormDescription(item.description);
    setFormNotes(item.notes || '');
    setFormComponentType(item.componentType);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDuplicate = (item: MaintenanceItem) => {
    feedback('success');
    onAddItem({
      bikeId: bike.id,
      name: `${item.name} (สำเนา)`,
      thaiName: `${item.thaiName} (สำเนา)`,
      brand: item.brand,
      model: item.model,
      componentType: item.componentType,
      category: item.category,
      intervalKm: item.intervalKm,
      intervalMonths: item.intervalMonths,
      lastServiceMileage: item.lastServiceMileage,
      lastServiceDate: item.lastServiceDate,
      cost: item.cost,
      description: item.description,
      notes: item.notes,
    });
    setOpenMenuId(null);
  };

  const handleSaveItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formThaiName.trim()) return;
    feedback('success');

    if (editingItem) {
      // 30.5 UPDATE
      onUpdateItem({
        ...editingItem,
        name: formName || formThaiName,
        thaiName: formThaiName,
        brand: formBrand,
        model: formModel,
        cost: Number(formCost) || 0,
        lastServiceMileage: Number(formInstalledMileage) || 0,
        lastServiceDate: formInstalledDate,
        intervalKm: Number(formIntervalKm) || 10000,
        intervalMonths: Number(formIntervalMonths) || 12,
        description: formDescription,
        notes: formNotes,
        componentType: formComponentType,
      });
    } else {
      // 30.5 CREATE
      onAddItem({
        bikeId: bike.id,
        name: formName || formThaiName,
        thaiName: formThaiName,
        brand: formBrand,
        model: formModel,
        category: 'repair',
        cost: Number(formCost) || 0,
        lastServiceMileage: Number(formInstalledMileage) || bike.currentMileage,
        lastServiceDate: formInstalledDate,
        intervalKm: Number(formIntervalKm) || 10000,
        intervalMonths: Number(formIntervalMonths) || 12,
        description: formDescription,
        notes: formNotes,
        componentType: formComponentType,
      });
    }

    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15191E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              การบำรุงรักษารถมอเตอร์ไซค์
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            แก้ไขข้อมูลอะไหล่ ยี่ห้อ ราคา รอบการเปลี่ยน และคำนวณสถานะ 🟢 ปกติ 🟡 ใกล้ถึงกำหนด 🔴 ถึงกำหนดอัตโนมัติ
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition cursor-pointer self-start sm:self-center shrink-0"
          title="เพิ่มรายการอะไหล่ (＋)"
          aria-label="เพิ่มรายการอะไหล่"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-[#15191E]/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ทั้งหมด ({currentBikeItems.length})
          </button>

          <button
            onClick={() => setFilter('urgent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
              filter === 'urgent'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ต้องตรวจเช็ค</span>
            {(overdueCount > 0 || dueSoonCount > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {overdueCount + dueSoonCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('normal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'normal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ปกติ ({currentBikeItems.length - overdueCount - dueSoonCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
          เลขไมล์ปัจจุบัน: <strong className="text-slate-900 dark:text-white">{bike.currentMileage.toLocaleString()} km</strong>
        </div>
      </div>

      {/* 30.5 Parts List with CRUD Buttons & ⋮ Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((health) => {
          const item = health.item;
          const isOverdue = health.urgency === 'overdue';
          const isDueSoon = health.urgency === 'due_soon';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-white dark:bg-[#15191E] border transition shadow-sm dark:shadow-md flex flex-col justify-between relative ${
                isOverdue
                  ? 'border-rose-500/50 hover:border-rose-400'
                  : isDueSoon
                  ? 'border-amber-500/50 hover:border-amber-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
              }`}
            >
              <div>
                {/* Top Item Title & Status Badge & Menu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                      {getComponentIcon(item.componentType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.thaiName}</h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                        {item.brand ? `${item.brand} ${item.model || ''}` : item.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Status Badge */}
                    {isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-500/40">
                        🔴 ถึงกำหนดแล้ว
                      </span>
                    ) : isDueSoon ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold border border-amber-500/40">
                        🟡 ใกล้ถึงกำหนด
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-500/40">
                        🟢 ปกติ
                      </span>
                    )}

                    {/* 30.16 Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 text-xs">
                            <button
                              onClick={() => openEditModal(item)}
                              className="w-full text-left p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                              <span>แก้ไขอะไหล่</span>
                            </button>
                            <button
                              onClick={() => handleDuplicate(item)}
                              className="w-full text-left p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>ทำสำเนา</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setItemToDelete(item);
                              }}
                              className="w-full text-left p-2 rounded-xl text-rose-500 hover:bg-rose-500/15 transition flex items-center space-x-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบรายการ</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Metric Box */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">สถานะระยะทาง:</span>
                    <strong className={`font-mono text-sm ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {health.kmRemaining > 0
                        ? `เหลืออีก ${health.kmRemaining.toLocaleString()} km`
                        : `เกินกำหนด ${Math.abs(health.kmRemaining).toLocaleString()} km`}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>เปลี่ยนล่าสุดที่ไมล์:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{item.lastServiceMileage.toLocaleString()} km</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>รอบการตรวจเช็คทุก:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{item.intervalKm.toLocaleString()} km</span>
                  </div>
                </div>

                {/* Wear Progress */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>ความสึกหรอตามระยะ</span>
                    <span className="font-mono">{health.percentWear}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverdue
                          ? 'bg-rose-500'
                          : isDueSoon
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${health.percentWear}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (34.7: Icon-only actions [✏️] [🗑️] [ℹ️] [✓] with tooltips & 44px touch targets) */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1677FF] border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center cursor-pointer shrink-0"
                    title="แก้ไขอะไหล่ (✏️)"
                    aria-label="แก้ไขอะไหล่"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-850 hover:bg-[#EF4444]/20 text-[#EF4444] border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center cursor-pointer shrink-0"
                    title="ลบรายการ (🗑️)"
                    aria-label="ลบรายการ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveItemDetail(item)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center cursor-pointer shrink-0"
                    title="ดูรายละเอียดข้อมูลอะไหล่"
                    aria-label="ดูรายละเอียดข้อมูลอะไหล่"
                  >
                    <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenServiceModal(item)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/40 transition flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                  title="บันทึกเปลี่ยนแล้ว / สำเร็จ (✓)"
                  aria-label="บันทึกเปลี่ยนแล้ว"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {activeItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  {getComponentIcon(activeItemDetail.componentType)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {activeItemDetail.thaiName}
                  </h3>
                  <span className="text-xs text-slate-400">{activeItemDetail.name}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveItemDetail(null);
                  if (onCloseItemModal) onCloseItemModal();
                }}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">คำแนะนำและการดูแลรักษา:</span>
                <p className="text-slate-200 leading-relaxed">
                  {activeItemDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">รอบการเปลี่ยน</span>
                  <strong className="text-white font-mono text-base mt-0.5 block">
                    {activeItemDetail.intervalKm.toLocaleString()} km
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">เปลี่ยนล่าสุดเมื่อ</span>
                  <strong className="text-white font-mono text-base mt-0.5 block">
                    {activeItemDetail.lastServiceDate || 'ไม่มีข้อมูล'}
                  </strong>
                </div>
              </div>

              {activeItemDetail.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block mb-0.5">หมายเหตุ:</span>
                  {activeItemDetail.notes}
                </div>
              )}

              <button
                onClick={() => {
                  onAskAI(
                    `สำหรับรถ ${bike.name} ชิ้นส่วน ${activeItemDetail.thaiName} มีวิธีตรวจเช็คสภาพด้วยตนเองอย่างไร และราคาอะไหล่แท้เบิกศูนย์ประมาณเท่าไร?`
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ถามช่าง AI เกี่ยวกับ {activeItemDetail.thaiName}</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const itm = activeItemDetail;
                  setActiveItemDetail(null);
                  openEditModal(itm);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-blue-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูลอะไหล่</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setActiveItemDetail(null);
                    if (onCloseItemModal) onCloseItemModal();
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    handleOpenServiceModal(activeItemDetail);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  บันทึกเปลี่ยนแล้ว
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 30.5 EDIT / ADD PART MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveItemForm}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingItem ? 'แก้ไขข้อมูลอะไหล่' : 'เพิ่มรายการอะไหล่ใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่ออะไหล่ (ภาษาไทย) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผ้าเบรกหน้า, น้ำมันเครื่องสังเคราะห์แท้"
                  value={formThaiName}
                  onChange={(e) => setFormThaiName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ยี่ห้ออะไหล่</label>
                  <input
                    type="text"
                    placeholder="เช่น Honda, Motul, NGK"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">รุ่น / เบอร์อะไหล่</label>
                  <input
                    type="text"
                    placeholder="เช่น CPR8EA-9, 10W-30"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    วันที่ติดตั้ง / เปลี่ยนล่าสุด
                  </label>
                  <input
                    type="date"
                    required
                    value={formInstalledDate}
                    onChange={(e) => setFormInstalledDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    เลขไมล์ตอนติดตั้ง (กม.)
                  </label>
                  <input
                    type="number"
                    required
                    value={formInstalledMileage}
                    onChange={(e) => setFormInstalledMileage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ระยะทางที่ควรเปลี่ยน (กม.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formIntervalKm}
                    onChange={(e) => setFormIntervalKm(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ราคาโดยประมาณ (บาท)
                  </label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">คำอธิบายสเปค</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ตรวจสอบความหนาของร่องผ้าเบรกสม่ำเสมอ"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="บันทึกเพิ่มเติม เช่น ซื้อจากศูนย์ หรือร้านออนไลน์"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SERVICE CONFIRMATION MODAL */}
      {isServiceModalOpen && serviceTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmService}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  บันทึกการเปลี่ยน: {serviceTargetItem.thaiName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เลขไมล์ที่เปลี่ยน (กม.) *
                </label>
                <input
                  type="number"
                  required
                  value={serviceOdometer}
                  onChange={(e) => setServiceOdometer(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ค่าใช้จ่ายทั้งหมด (บาท) *
                </label>
                <input
                  type="number"
                  required
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ร้านซ่อม / ศูนย์บริการ
                </label>
                <input
                  type="text"
                  value={serviceShop}
                  onChange={(e) => setServiceShop(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  หมายเหตุ / ยี่ห้ออะไหล่
                </label>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                บันทึกและรีเซ็ตระยะ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 30.10 CONFIRM DELETE PART MODAL */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        title="ลบรายการอะไหล่"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการอะไหล่ "${itemToDelete?.thaiName}"? การแจ้งเตือนสำหรับรายการนี้จะถูกยกเลิก`}
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
      />
    </div>
  );
};
