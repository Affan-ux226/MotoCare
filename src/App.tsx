import React, { useState, useEffect } from 'react';
import {
  MotorcycleProfile,
  MaintenanceItem,
  ExpenseRecord,
  MileageLog,
  FuelRecord,
  VehicleDocument,
  UserProfile,
  AuditLog,
  UserSession,
} from './types';
import {
  initialUserProfile,
  initialBikes,
  initialMaintenanceItems,
  initialFuelRecords,
  initialDocuments,
  initialExpenses,
  initialMileageLogs,
} from './data/initialData';
import { calculateOilStatus, calculateItemHealth } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { MaintenanceStatusView } from './components/MaintenanceStatusView';
import { FuelLoggerView } from './components/FuelLoggerView';
import { FinancialAnalyticsView } from './components/FinancialAnalyticsView';
import { RepairHistoryView } from './components/RepairHistoryView';
import { DocumentsView } from './components/DocumentsView';
import { AIChatAssistant } from './components/AIChatAssistant';
import { AddVehicleModal } from './components/AddVehicleModal';
import { EditBikeModal } from './components/EditBikeModal';
import { QuickAddModal } from './components/QuickAddModal';
import { DataBackupModal } from './components/DataBackupModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SnackbarNotification } from './components/SnackbarNotification';
import { MileageTracker } from './components/MileageTracker';
import { SplashScreen } from './components/SplashScreen';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { GarageView } from './components/GarageView';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  getCurrentSession,
  clearSession,
  ensureDemoUserInitialized,
  seedUserDataIfEmpty,
  loadUserBikes,
  saveUserBikes,
  loadUserActiveBikeId,
  saveUserActiveBikeId,
  loadUserMaintenanceItems,
  saveUserMaintenanceItems,
  loadUserFuelRecords,
  saveUserFuelRecords,
  loadUserExpenses,
  saveUserExpenses,
  loadUserDocuments,
  saveUserDocuments,
  loadUserMileageLogs,
  saveUserMileageLogs,
  loadUserAuditLogs,
  saveUserAuditLogs,
  loadUserProfile,
  saveUserProfile,
  clearCurrentSession,
  clearUserData,
} from './utils/authService';
import { Gauge, Sparkles, AlertTriangle, LogOut } from 'lucide-react';

const STORAGE_KEYS = {
  THEME: 'motocare_theme_mode_v2',
};

export default function App() {
  // Session & Auth Modal State (Bypass login at startup)
  const [session, setSession] = useState<UserSession | null>(() => getCurrentSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isGlobalLogoutDialogOpen, setIsGlobalLogoutDialogOpen] = useState<boolean>(false);

  // Initialize demo user in background
  useEffect(() => {
    ensureDemoUserInitialized();
  }, []);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) {
      return saved === 'dark';
    }
    return true; // Default Dark Mode
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#0B0D10');
    } else {
      document.documentElement.classList.remove('dark');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#F4F6F9');
    }
  }, [isDarkMode]);

  // User Profile State (Segregated by userId)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserProfile(current.userId, {
        ...initialUserProfile,
        id: current.userId,
        name: current.name,
        email: current.email,
      });
    }
    return initialUserProfile;
  });

  // Motorcycles State (Segregated by userId)
  const [bikes, setBikes] = useState<MotorcycleProfile[]>(() => {
    const current = getCurrentSession();
    if (current) {
      const userBikes = loadUserBikes(current.userId);
      if (userBikes.length > 0) return userBikes;
    }
    return initialBikes;
  });

  const [activeBikeId, setActiveBikeId] = useState<string>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserActiveBikeId(current.userId, bikes[0]?.id || initialBikes[0].id);
    }
    return initialBikes[0]?.id || 'bike-msx-125';
  });

  const activeBike = bikes.find((b) => b.id === activeBikeId) || bikes[0] || initialBikes[0];

  // Maintenance Items State
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(() => {
    const current = getCurrentSession();
    if (current) {
      const items = loadUserMaintenanceItems(current.userId);
      if (items.length > 0) return items;
    }
    return initialMaintenanceItems;
  });

  // Fuel Records State
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserFuelRecords(current.userId);
    }
    return initialFuelRecords;
  });

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserExpenses(current.userId);
    }
    return initialExpenses;
  });

  // Mileage Logs State
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserMileageLogs(current.userId);
    }
    return initialMileageLogs;
  });

  // Vehicle Documents State
  const [documents, setDocuments] = useState<VehicleDocument[]>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserDocuments(current.userId);
    }
    return initialDocuments;
  });

  // 30.11 Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const current = getCurrentSession();
    if (current) {
      return loadUserAuditLogs(current.userId);
    }
    return [];
  });

  // 30.9 Undo & Snackbar State
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [undoCallback, setUndoCallback] = useState<(() => void) | null>(null);

  const showSnackbar = (msg: string, undoFn?: () => void) => {
    setSnackbarMessage(msg);
    setUndoCallback(undoFn ? () => undoFn : null);
  };

  const addAuditLog = (
    entityType: AuditLog['entityType'],
    action: AuditLog['action'],
    title: string,
    description: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const now = new Date();
    const thaiDateStr = `${now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;

    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: thaiDateStr,
      entityType,
      action,
      title,
      description,
      oldValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 31.13 Auth Lifecycle & Splash Handler
  const handleSplashFinish = () => {
    const existingSession = getCurrentSession();
    setSession(existingSession);
    setIsSplashActive(false);
  };

  // Action Guard: เก็บ Action ที่ต้องทำหลังจากเข้าสู่ระบบสำเร็จ
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 1. เพิ่มฟังก์ชันจัดการตอน Login สำเร็จ (พร้อมโอนย้ายข้อมูล Guest และล้างข้อมูลขยะ)
  const handleAuthSuccess = (newSession: UserSession) => {
    // 1. ตรวจสอบว่ามีข้อมูลของ Guest อยู่หรือไม่ (เช่น มีรถที่ถูกสร้างไว้)
    const guestBikes = loadUserBikes('guest');

    if (guestBikes.length > 0) {
      // 2. โอนย้ายข้อมูลจาก Guest ไปยัง User ID ใหม่ ป้องกัน ID Collision (Data Overwrite)
      const existingUserBikes = loadUserBikes(newSession.userId);
      const existingBikeIds = new Set(existingUserBikes.map((b) => b.id));

      // ตารางแมป ID รถเก่า (Guest) -> ID รถใหม่ (ป้องกันรหัสซ้ำชนกับของจริง)
      const bikeIdMap = new Map<string, string>();
      const migratedBikes: MotorcycleProfile[] = [];

      guestBikes.forEach((gBike) => {
        if (existingBikeIds.has(gBike.id)) {
          // หาก ID ซ้ำกับรถที่มีอยู่แล้วในบัญชีจริง ให้สร้าง ID ใหม่และตั้งชื่อให้แยกแยะได้
          const newId = `bike-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          bikeIdMap.set(gBike.id, newId);
          migratedBikes.push({
            ...gBike,
            id: newId,
            name: `${gBike.name} (จาก Guest)`,
          });
        } else {
          bikeIdMap.set(gBike.id, gBike.id);
          migratedBikes.push(gBike);
        }
      });

      saveUserBikes(newSession.userId, [...existingUserBikes, ...migratedBikes]);

      // โอนย้ายรายการค่าน้ำมัน พร้อมสร้าง ID ใหม่และผูกกับ bikeId ที่แมปไว้
      const guestFuel = loadUserFuelRecords('guest');
      if (guestFuel.length > 0) {
        const existingFuel = loadUserFuelRecords(newSession.userId);
        const remappedFuel = guestFuel.map((f) => ({
          ...f,
          id: `fuel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          bikeId: bikeIdMap.get(f.bikeId) || f.bikeId,
        }));
        saveUserFuelRecords(newSession.userId, [...existingFuel, ...remappedFuel]);
      }

      // โอนย้ายรายการค่าใช้จ่าย พร้อมสร้าง ID ใหม่
      const guestExpenses = loadUserExpenses('guest');
      if (guestExpenses.length > 0) {
        const existingExp = loadUserExpenses(newSession.userId);
        const remappedExpenses = guestExpenses.map((e) => ({
          ...e,
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          bikeId: bikeIdMap.get(e.bikeId) || e.bikeId,
        }));
        saveUserExpenses(newSession.userId, [...existingExp, ...remappedExpenses]);
      }

      // โอนย้ายบันทึกเลขไมล์ พร้อมสร้าง ID ใหม่
      const guestLogs = loadUserMileageLogs('guest');
      if (guestLogs.length > 0) {
        const existingLogs = loadUserMileageLogs(newSession.userId);
        const remappedLogs = guestLogs.map((l) => ({
          ...l,
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          bikeId: bikeIdMap.get(l.bikeId) || l.bikeId,
        }));
        saveUserMileageLogs(newSession.userId, [...existingLogs, ...remappedLogs]);
      }

      // โอนย้ายเอกสาร
      const guestDocs = loadUserDocuments('guest');
      if (guestDocs.length > 0) {
        const existingDocs = loadUserDocuments(newSession.userId);
        const remappedDocs = guestDocs.map((d) => ({
          ...d,
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          bikeId: bikeIdMap.get(d.bikeId) || d.bikeId,
        }));
        saveUserDocuments(newSession.userId, [...existingDocs, ...remappedDocs]);
      }

      // โอนย้ายรายการอะไหล่
      const guestItems = loadUserMaintenanceItems('guest');
      if (guestItems.length > 0) {
        const existingItems = loadUserMaintenanceItems(newSession.userId);
        const existingItemIds = new Set(existingItems.map((i) => i.id));
        const newItems = guestItems
          .filter((gi) => !existingItemIds.has(gi.id))
          .map((item) => ({
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          }));
        saveUserMaintenanceItems(newSession.userId, [...existingItems, ...newItems]);
      }

      // โอนย้ายประวัติการเปลี่ยนแปลง (Audit Logs)
      const guestAudit = loadUserAuditLogs('guest');
      if (guestAudit.length > 0) {
        const existingAudit = loadUserAuditLogs(newSession.userId);
        saveUserAuditLogs(newSession.userId, [...existingAudit, ...guestAudit]);
      }

      // 3. ล้างข้อมูล Guest ทิ้ง เพื่อไม่ให้ขยะตกค้างและป้องกัน Data Leak
      clearUserData('guest');
    }

    // 4. เซ็ต Session ใหม่ และปิด Modal
    setSession(newSession);
    setIsAuthModalOpen(false);
    setActiveTab('overview');
    showSnackbar(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${newSession.name} 👋`);
  };

  // แก้ปัญหา Race Condition: ให้ React จัดการจังหวะที่ถูกต้องผ่าน useEffect
  useEffect(() => {
    if (session && pendingAction) {
      // ถ้าระบบมี session แล้ว และมีคำสั่งค้างอยู่ ให้รันทันที
      pendingAction();
      setPendingAction(null); // เคลียร์ทิ้งหลังรันเสร็จ
    }
  }, [session, pendingAction]);

  // 2. ฟังก์ชันสำหรับดักจับ Action (Action Guard)
  const requireAuth = (actionCallback: () => void, promptMessage?: string) => {
    if (!session) {
      // ถ้ายังไม่ล็อกอิน ให้จำ Action ไว้ และเด้ง Auth Modal
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
      showSnackbar(promptMessage || 'กรุณาเข้าสู่ระบบก่อนทำรายการนี้ 🔒');
    } else {
      // ถ้าล็อกอินแล้ว ให้ทำคำสั่งนั้นได้เลย
      actionCallback();
    }
  };

  // 3. ฟังก์ชันสำหรับจัดการ Logout
  const handleLogout = () => {
    // 1. ลบ Session ออก
    clearCurrentSession();
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    setSession(null);

    // 2. รีเซ็ต State ข้อมูลทั้งหมดในหน้าจอให้กลับเป็นของ Guest (ข้อมูลเริ่มต้น)
    clearUserData('guest');
    setBikes(initialBikes);
    setActiveBikeId(initialBikes[0].id);
    setUserProfile(initialUserProfile);
    setMaintenanceItems(initialMaintenanceItems);
    setFuelRecords(initialFuelRecords);
    setExpenses(initialExpenses);
    setMileageLogs(initialMileageLogs);
    setDocuments(initialDocuments);
    setAuditLogs([]);

    // 3. ปิด Dialog และแจ้งเตือน
    setIsGlobalLogoutDialogOpen(false);
    setActiveTab('overview');
    showSnackbar('ออกจากระบบเรียบร้อย (เข้าสู่โหมด Guest) ✓');
  };

  // 31.7 & 31.14 Load user-specific or guest data whenever session changes
  useEffect(() => {
    const uid = session?.userId || 'guest';
    seedUserDataIfEmpty(uid);
    const uBikes = loadUserBikes(uid);
    const uProfile = loadUserProfile(uid, {
      ...initialUserProfile,
      id: uid,
      name: session?.name || initialUserProfile.name,
      email: session?.email || (session ? '' : 'guest@motocare.app'),
    });
    const uActiveBikeId = loadUserActiveBikeId(uid, uBikes[0]?.id || initialBikes[0].id);
    const uItems = loadUserMaintenanceItems(uid);
    const uFuel = loadUserFuelRecords(uid);
    const uExpenses = loadUserExpenses(uid);
    const uDocs = loadUserDocuments(uid);
    const uLogs = loadUserMileageLogs(uid);
    const uAudit = loadUserAuditLogs(uid);

    setBikes(uBikes.length > 0 ? uBikes : initialBikes);
    setActiveBikeId(uActiveBikeId);
    setUserProfile(uProfile);
    setMaintenanceItems(uItems.length > 0 ? uItems : initialMaintenanceItems);
    setFuelRecords(uFuel.length > 0 ? uFuel : initialFuelRecords);
    setExpenses(uExpenses.length > 0 ? uExpenses : initialExpenses);
    setDocuments(uDocs.length > 0 ? uDocs : initialDocuments);
    setMileageLogs(uLogs.length > 0 ? uLogs : initialMileageLogs);
    setAuditLogs(uAudit);
  }, [session?.userId]);

  // Sync to User-Specific Storage (Works seamlessly for 'guest' or logged-in accounts)
  const currentUserId = session?.userId || 'guest';

  useEffect(() => {
    saveUserProfile(currentUserId, userProfile);
  }, [userProfile, currentUserId]);

  useEffect(() => {
    saveUserBikes(currentUserId, bikes);
  }, [bikes, currentUserId]);

  useEffect(() => {
    saveUserActiveBikeId(currentUserId, activeBikeId);
  }, [activeBikeId, currentUserId]);

  useEffect(() => {
    saveUserMaintenanceItems(currentUserId, maintenanceItems);
  }, [maintenanceItems, currentUserId]);

  useEffect(() => {
    saveUserFuelRecords(currentUserId, fuelRecords);
  }, [fuelRecords, currentUserId]);

  useEffect(() => {
    saveUserExpenses(currentUserId, expenses);
  }, [expenses, currentUserId]);

  useEffect(() => {
    saveUserMileageLogs(currentUserId, mileageLogs);
  }, [mileageLogs, currentUserId]);

  useEffect(() => {
    saveUserDocuments(currentUserId, documents);
  }, [documents, currentUserId]);

  useEffect(() => {
    saveUserAuditLogs(currentUserId, auditLogs);
  }, [auditLogs, currentUserId]);

  // UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditBikeModalOpen, setIsEditBikeModalOpen] = useState(false);
  const [isQuickMileageModalOpen, setIsQuickMileageModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = useState<'fuel' | 'oil' | 'service' | 'expense'>('fuel');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MaintenanceItem | null>(null);
  const [chatPrefillPrompt, setChatPrefillPrompt] = useState<string | undefined>(undefined);

  const [quickInputMileage, setQuickInputMileage] = useState(activeBike.currentMileage + 20);

  // Status metrics
  const oilStatus = calculateOilStatus(activeBike);
  const isOilOverdue = oilStatus.status === 'overdue';
  const healthList = maintenanceItems
    .filter((i) => i.bikeId === activeBike.id || !i.bikeId)
    .map((item) => calculateItemHealth(item, activeBike.currentMileage, activeBike.dailyAverageKm));
  const dueSoonCount = healthList.filter((h) => h.urgency !== 'normal').length;

  // HANDLERS

  // 30.1 Vehicle CRUD
  const handleSelectBike = (bikeId: string) => {
    setActiveBikeId(bikeId);
  };

  const handleAddVehicle = (newBike: MotorcycleProfile) => {
    setBikes((prev) => [...prev, newBike]);
    setActiveBikeId(newBike.id);
    addAuditLog('bike', 'create', 'เพิ่มรถคันใหม่', `เพิ่มรถ ${newBike.name} ทะเบียน ${newBike.plateNumber}`);
    showSnackbar(`เพิ่มรถ ${newBike.name} เรียบร้อยแล้ว ✓`);
  };

  const handleUpdateBike = (updated: MotorcycleProfile) => {
    const old = bikes.find((b) => b.id === updated.id);
    setBikes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    addAuditLog(
      'bike',
      'update',
      'แก้ไขข้อมูลรถ',
      `แก้ไขข้อมูลรถ ${updated.name}`,
      old ? `${old.name} (${old.currentMileage} km)` : undefined,
      `${updated.name} (${updated.currentMileage} km)`
    );
    showSnackbar('แก้ไขข้อมูลรถเรียบร้อย ✓', () => {
      if (old) setBikes((prev) => prev.map((b) => (b.id === old.id ? old : b)));
    });
  };

  const handleUpdateBikeQuick = (updated: MotorcycleProfile, changeDesc?: string) => {
    const old = bikes.find((b) => b.id === updated.id);
    setBikes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    addAuditLog(
      'bike',
      'update',
      changeDesc || 'แก้ไขข้อมูลรถแบบ Inline',
      `อัปเดต ${updated.name}`,
      old?.currentMileage !== updated.currentMileage ? `${old?.currentMileage} km` : old?.name,
      old?.currentMileage !== updated.currentMileage ? `${updated.currentMileage} km` : updated.name
    );
    showSnackbar(`${changeDesc || 'แก้ไขข้อมูลเรียบร้อย'} ✓`, () => {
      if (old) setBikes((prev) => prev.map((b) => (b.id === old.id ? old : b)));
    });
  };

  // 32.1 & 32.6 Update Bike Photo across all views
  const handleUpdateBikePhoto = (bikeId: string, newPhotoUrl: string | undefined) => {
    setBikes((prev) =>
      prev.map((b) => (b.id === bikeId ? { ...b, photoUrl: newPhotoUrl } : b))
    );
    const target = bikes.find((b) => b.id === bikeId);
    addAuditLog('bike', 'update', 'อัปเดตรูปรถ', `เปลี่ยนรูปภาพสำหรับ ${target?.name || 'รถ'}`);
    showSnackbar('อัปเดตรูปรถมอเตอร์ไซค์เรียบร้อย ✓');
  };

  const handleDeleteBike = (bikeId: string) => {
    if (bikes.length <= 1) {
      alert('คุณต้องมีรถอย่างน้อย 1 คันในระบบ');
      return;
    }
    const bikeToDelete = bikes.find((b) => b.id === bikeId);
    const remaining = bikes.filter((b) => b.id !== bikeId);
    setBikes(remaining);
    setActiveBikeId(remaining[0].id);
    addAuditLog('bike', 'delete', 'ลบรถออกจากระบบ', `ลบรถ ${bikeToDelete?.name || bikeId}`);
    showSnackbar(`ลบรถ ${bikeToDelete?.name} เรียบร้อย`, () => {
      if (bikeToDelete) {
        setBikes((prev) => [...prev, bikeToDelete]);
        setActiveBikeId(bikeToDelete.id);
      }
    });
  };

  // 30.2 Fuel CRUD
  const handleAddFuelRecord = (newFuelData: Omit<FuelRecord, 'id'>) => {
    const newRecord: FuelRecord = {
      ...newFuelData,
      id: `fuel-${Date.now()}`,
    };
    setFuelRecords((prev) => [newRecord, ...prev]);

    // Also add to expenses
    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      bikeId: activeBike.id,
      date: newRecord.date,
      title: `เติมน้ำมัน ${newRecord.fuelType} (${newRecord.liters} ลิตร)`,
      category: 'fuel',
      amount: newRecord.totalCost,
      mileage: newRecord.odometer,
      shopName: newRecord.gasStation,
      notes: newRecord.notes,
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Sync bike odometer if greater
    if (newRecord.odometer > activeBike.currentMileage) {
      setBikes((prev) =>
        prev.map((b) => (b.id === activeBike.id ? { ...b, currentMileage: newRecord.odometer } : b))
      );
    }

    addAuditLog('fuel', 'create', 'เติมน้ำมัน', `เติม ${newRecord.gasStation} ฿${newRecord.totalCost}`);
    showSnackbar('บันทึกการเติมน้ำมันเรียบร้อย ✓');
  };

  const handleUpdateFuelRecord = (updated: FuelRecord) => {
    const old = fuelRecords.find((r) => r.id === updated.id);
    setFuelRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    addAuditLog(
      'fuel',
      'update',
      'แก้ไขข้อมูลน้ำมัน',
      `แก้ไขรายการเติมน้ำมัน ${updated.gasStation}`,
      old ? `฿${old.totalCost} (${old.liters}L)` : undefined,
      `฿${updated.totalCost} (${updated.liters}L)`
    );
    showSnackbar('แก้ไขข้อมูลน้ำมันเรียบร้อย ✓', () => {
      if (old) setFuelRecords((prev) => prev.map((r) => (r.id === old.id ? old : r)));
    });
  };

  const handleDeleteFuelRecord = (id: string) => {
    const toDelete = fuelRecords.find((r) => r.id === id);
    setFuelRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('fuel', 'delete', 'ลบรายการน้ำมัน', `ลบรายการวันที่ ${toDelete?.date} ฿${toDelete?.totalCost}`);
    showSnackbar('ลบรายการเติมน้ำมันเรียบร้อย', () => {
      if (toDelete) setFuelRecords((prev) => [toDelete, ...prev]);
    });
  };

  // 30.3 Expense CRUD
  const handleAddExpense = (newExpenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    if (newExp.mileage > activeBike.currentMileage) {
      setBikes((prev) =>
        prev.map((b) => (b.id === activeBike.id ? { ...b, currentMileage: newExp.mileage } : b))
      );
    }
    addAuditLog('expense', 'create', 'เพิ่มค่าใช้จ่าย', `บันทึก ${newExp.title} ฿${newExp.amount}`);
    showSnackbar('บันทึกค่าใช้จ่ายเรียบร้อย ✓');
  };

  const handleUpdateExpense = (updated: ExpenseRecord) => {
    const old = expenses.find((e) => e.id === updated.id);
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addAuditLog(
      'expense',
      'update',
      'แก้ไขค่าใช้จ่าย',
      `แก้ไข ${updated.title}`,
      old ? `฿${old.amount}` : undefined,
      `฿${updated.amount}`
    );
    showSnackbar('แก้ไขรายการค่าใช้จ่ายเรียบร้อย ✓', () => {
      if (old) setExpenses((prev) => prev.map((e) => (e.id === old.id ? old : e)));
    });
  };

  const handleDeleteExpense = (id: string) => {
    const toDelete = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('expense', 'delete', 'ลบค่าใช้จ่าย', `ลบรายการ ${toDelete?.title} ฿${toDelete?.amount}`);
    showSnackbar('ลบรายการค่าใช้จ่ายเรียบร้อย', () => {
      if (toDelete) setExpenses((prev) => [toDelete, ...prev]);
    });
  };

  // 30.4 Repair CRUD (uses expenses collection with category='repair'/'service')
  const handleUpdateRepairExpense = (updated: ExpenseRecord) => {
    handleUpdateExpense(updated);
  };

  // 30.5 Parts & Maintenance CRUD
  const handleAddItem = (newItemData: Omit<MaintenanceItem, 'id'>) => {
    const newItem: MaintenanceItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
    };
    setMaintenanceItems((prev) => [...prev, newItem]);
    addAuditLog('maintenance', 'create', 'เพิ่มรายการอะไหล่', `เพิ่ม ${newItem.thaiName}`);
    showSnackbar(`เพิ่มรายการ ${newItem.thaiName} เรียบร้อยแล้ว ✓`);
  };

  const handleUpdateItem = (updated: MaintenanceItem) => {
    const old = maintenanceItems.find((i) => i.id === updated.id);
    setMaintenanceItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    addAuditLog(
      'maintenance',
      'update',
      'แก้ไขข้อมูลอะไหล่',
      `แก้ไข ${updated.thaiName}`,
      old ? `รอบ ${old.intervalKm} km` : undefined,
      `รอบ ${updated.intervalKm} km`
    );
    showSnackbar(`แก้ไขข้อมูล ${updated.thaiName} เรียบร้อยแล้ว ✓`, () => {
      if (old) setMaintenanceItems((prev) => prev.map((i) => (i.id === old.id ? old : i)));
    });
  };

  const handleDeleteItem = (id: string) => {
    const toDelete = maintenanceItems.find((i) => i.id === id);
    setMaintenanceItems((prev) => prev.filter((i) => i.id !== id));
    addAuditLog('maintenance', 'delete', 'ลบรายการอะไหล่', `ลบ ${toDelete?.thaiName}`);
    showSnackbar(`ลบรายการ ${toDelete?.thaiName} เรียบร้อย`, () => {
      if (toDelete) setMaintenanceItems((prev) => [...prev, toDelete]);
    });
  };

  // Service item action
  const handleServiceMaintenanceItem = (
    itemId: string,
    cost: number,
    shopName: string,
    notes: string,
    odometer: number
  ) => {
    const targetItem = maintenanceItems.find((i) => i.id === itemId);
    if (!targetItem) return;
    const todayStr = new Date().toISOString().split('T')[0];

    setMaintenanceItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, lastServiceMileage: odometer, lastServiceDate: todayStr }
          : item
      )
    );

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      bikeId: activeBike.id,
      date: todayStr,
      title: `เปลี่ยน/บริการ: ${targetItem.thaiName}`,
      category: targetItem.category,
      amount: cost,
      mileage: odometer,
      shopName: shopName || 'อู่บริการ',
      notes,
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (odometer > activeBike.currentMileage) {
      setBikes((prev) =>
        prev.map((b) => (b.id === activeBike.id ? { ...b, currentMileage: odometer } : b))
      );
    }

    addAuditLog('maintenance', 'update', 'บันทึกการเปลี่ยนอะไหล่', `เปลี่ยน ${targetItem.thaiName} ฿${cost}`);
    showSnackbar(`บันทึกการเปลี่ยน ${targetItem.thaiName} เรียบร้อยแล้ว ✓`);
  };

  // Record Oil Change
  const handleRecordOilChange = (record: {
    mileage: number;
    date: string;
    amount: number;
    oilType: string;
    shopName: string;
    notes: string;
  }) => {
    setBikes((prev) =>
      prev.map((b) =>
        b.id === activeBike.id
          ? {
              ...b,
              currentMileage: Math.max(b.currentMileage, record.mileage),
              lastOilChangeMileage: record.mileage,
              lastOilChangeDate: record.date,
            }
          : b
      )
    );

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      bikeId: activeBike.id,
      date: record.date,
      title: `ถ่ายน้ำมันเครื่อง (${record.oilType || activeBike.recommendedOilGrade})`,
      category: 'oil',
      amount: record.amount,
      mileage: record.mileage,
      shopName: record.shopName || 'ศูนย์บริการ',
      notes: record.notes,
      isOilChange: true,
    };
    setExpenses((prev) => [newExp, ...prev]);

    setMaintenanceItems((prev) =>
      prev.map((item) =>
        item.componentType === 'engine_oil' && (item.bikeId === activeBike.id || !item.bikeId)
          ? { ...item, lastServiceMileage: record.mileage, lastServiceDate: record.date }
          : item
      )
    );

    addAuditLog('maintenance', 'update', 'ถ่ายน้ำมันเครื่อง', `ถ่ายน้ำมันเครื่อง ฿${record.amount} ที่ไมล์ ${record.mileage} km`);
    showSnackbar('บันทึกการถ่ายน้ำมันเครื่องเรียบร้อย ✓');
  };

  // 30.6 Document CRUD
  const handleAddDocument = (newDocData: Omit<VehicleDocument, 'id'>) => {
    const newDoc: VehicleDocument = {
      ...newDocData,
      id: `doc-${Date.now()}`,
    };
    setDocuments((prev) => [...prev, newDoc]);
    if (newDoc.cost && newDoc.cost > 0) {
      setExpenses((prev) => [
        {
          id: `exp-${Date.now()}`,
          bikeId: activeBike.id,
          date: new Date().toISOString().split('T')[0],
          title: `ต่ออายุ: ${newDoc.title}`,
          category: 'tax_insurance',
          amount: newDoc.cost || 0,
          mileage: activeBike.currentMileage,
          shopName: newDoc.provider || 'กรมการขนส่งทางบก',
          notes: newDoc.notes,
        },
        ...prev,
      ]);
    }
    addAuditLog('document', 'create', 'เพิ่มเอกสารรถ', `เพิ่ม ${newDoc.title} หมดอายุ ${newDoc.expiryDate}`);
    showSnackbar(`เพิ่มเอกสาร ${newDoc.title} เรียบร้อย ✓`);
  };

  const handleUpdateDocument = (updated: VehicleDocument) => {
    const old = documents.find((d) => d.id === updated.id);
    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    addAuditLog(
      'document',
      'update',
      'แก้ไขเอกสารรถ',
      `แก้ไข ${updated.title}`,
      old?.expiryDate,
      updated.expiryDate
    );
    showSnackbar('แก้ไขเอกสารเรียบร้อย ✓', () => {
      if (old) setDocuments((prev) => prev.map((d) => (d.id === old.id ? old : d)));
    });
  };

  const handleDeleteDocument = (id: string) => {
    const toDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    addAuditLog('document', 'delete', 'ลบเอกสารรถ', `ลบ ${toDelete?.title}`);
    showSnackbar(`ลบเอกสาร ${toDelete?.title} เรียบร้อย`, () => {
      if (toDelete) setDocuments((prev) => [...prev, toDelete]);
    });
  };

  const handleRenewDocument = (id: string, newExpiryDate: string, cost: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, expiryDate: newExpiryDate, cost } : d))
    );
    const targetDoc = documents.find((d) => d.id === id);
    if (targetDoc && cost > 0) {
      setExpenses((prev) => [
        {
          id: `exp-${Date.now()}`,
          bikeId: activeBike.id,
          date: new Date().toISOString().split('T')[0],
          title: `ต่ออายุ: ${targetDoc.title}`,
          category: 'tax_insurance',
          amount: cost,
          mileage: activeBike.currentMileage,
          shopName: targetDoc.provider || 'กรมการขนส่งทางบก',
        },
        ...prev,
      ]);
    }
    addAuditLog('document', 'update', 'ต่ออายุเอกสาร', `ต่ออายุ ${targetDoc?.title} ถึง ${newExpiryDate}`);
    showSnackbar(`ต่ออายุ ${targetDoc?.title} เรียบร้อยแล้ว ✓`);
  };

  // 30.7 User Profile CRUD
  const handleSaveUserProfile = (updated: UserProfile) => {
    const oldName = userProfile.name;
    setUserProfile(updated);
    addAuditLog('profile', 'update', 'แก้ไขข้อมูลโปรไฟล์', `อัปเดตโปรไฟล์ของคุณ`, oldName, updated.name);
    showSnackbar('บันทึกข้อมูลโปรไฟล์เรียบร้อย ✓');
  };

  // Mileage logs
  const handleAddMileageLog = (newLogData: {
    mileage: number;
    date: string;
    note: string;
    type: MileageLog['type'];
  }) => {
    const trip = Math.max(0, newLogData.mileage - activeBike.currentMileage);
    const newLog: MileageLog = {
      id: `log-${Date.now()}`,
      bikeId: activeBike.id,
      date: newLogData.date,
      mileage: newLogData.mileage,
      note: newLogData.note,
      type: newLogData.type,
      tripDistance: trip,
    };
    setMileageLogs((prev) => [newLog, ...prev]);

    if (newLogData.mileage > activeBike.currentMileage) {
      setBikes((prev) =>
        prev.map((b) =>
          b.id === activeBike.id ? { ...b, currentMileage: newLogData.mileage } : b
        )
      );
    }
    showSnackbar('บันทึกเลขไมล์เรียบร้อย ✓');
  };

  const handleDeleteMileageLog = (id: string) => {
    setMileageLogs((prev) => prev.filter((l) => l.id !== id));
    showSnackbar('ลบรายการเลขไมล์เรียบร้อย');
  };

  const handleAskAI = (promptText: string) => {
    setChatPrefillPrompt(promptText);
    setActiveTab('chat');
  };

  // Data Export & Import
  const handleCloudSync = async () => {
    showSnackbar('กำลังเชื่อมต่อและซิงค์ข้อมูลกับคลาวด์...');
    try {
      await new Promise((res) => setTimeout(res, 500));
      if (session?.userId) {
        saveUserBikes(session.userId, bikes);
        saveUserProfile(session.userId, userProfile);
        saveUserMaintenanceItems(session.userId, maintenanceItems);
        saveUserFuelRecords(session.userId, fuelRecords);
        saveUserExpenses(session.userId, expenses);
        saveUserDocuments(session.userId, documents);
        saveUserMileageLogs(session.userId, mileageLogs);
        saveUserAuditLogs(session.userId, auditLogs);
      }
      showSnackbar('ซิงค์ข้อมูลขึ้นคลาวด์สำเร็จเรียบร้อยแล้ว ✓');
    } catch (e) {
      showSnackbar('การซิงค์ข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleExportData = () => {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      bikes,
      activeBikeId,
      maintenanceItems,
      fuelRecords,
      expenses,
      mileageLogs,
      documents,
      auditLogs,
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motocare-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('ส่งออกข้อมูลเป็นไฟล์ JSON เรียบร้อย ✓');
  };

  const handleImportData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.bikes && Array.isArray(data.bikes)) {
        setBikes(data.bikes);
        if (data.activeBikeId) setActiveBikeId(data.activeBikeId);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.maintenanceItems) setMaintenanceItems(data.maintenanceItems);
        if (data.fuelRecords) setFuelRecords(data.fuelRecords);
        if (data.expenses) setExpenses(data.expenses);
        if (data.mileageLogs) setMileageLogs(data.mileageLogs);
        if (data.documents) setDocuments(data.documents);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        showSnackbar('นำเข้าข้อมูลสำเร็จแล้ว ✓');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleResetData = () => {
    setBikes(initialBikes);
    setActiveBikeId(initialBikes[0].id);
    setUserProfile(initialUserProfile);
    setMaintenanceItems(initialMaintenanceItems);
    setFuelRecords(initialFuelRecords);
    setExpenses(initialExpenses);
    setMileageLogs(initialMileageLogs);
    setDocuments(initialDocuments);
    showSnackbar('รีเซ็ตข้อมูลตัวอย่างเรียบร้อย ✓');
  };

  // 31.1 Splash Screen
  if (isSplashActive) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Note: Login screen is no longer blocking! The user directly enters the app in Guest Mode.

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0D10] text-[#0F172A] dark:text-[#FFFFFF] flex font-['Prompt',sans-serif] selection:bg-[#1677FF] selection:text-white transition-colors duration-200">
      {/* 1. SIDEBAR สำหรับ Desktop: ซ่อนในมือถือ (hidden) แสดงในจอขนาด lg ขึ้นไป (lg:flex) */}
      <DesktopSidebar
        activeBike={activeBike}
        bikes={bikes}
        onSelectBike={handleSelectBike}
        onOpenAddBikeModal={() => setIsAddVehicleModalOpen(true)}
        onOpenEditBikeModal={() => setIsEditBikeModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMileageModal={() => {
          setQuickInputMileage(activeBike.currentMileage + 20);
          setIsQuickMileageModalOpen(true);
        }}
        onOpenQuickAddModal={() => {
          setQuickAddDefaultTab('fuel');
          setIsQuickAddModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOilOverdue={isOilOverdue}
        dueSoonCount={dueSoonCount}
        session={session}
        userProfile={userProfile}
        onLogoutClick={() => setIsGlobalLogoutDialogOpen(true)}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      {/* 2. พื้นที่เนื้อหาหลัก (Main content wrapper) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-safe lg:pb-0 overflow-x-hidden">
        {/* Top Guest Notice Banner (When not logged in) */}
        {!session && (
          <div className="bg-gradient-to-r from-blue-900/30 via-indigo-950/20 to-blue-900/30 border-b border-blue-500/20 px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 overflow-hidden max-w-7xl mx-auto justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="flex h-2 w-2 rounded-full bg-[#1677FF] animate-pulse shrink-0" />
                <span className="truncate">
                  🏍️ <strong>โหมดทดลองใช้งาน (Guest Mode)</strong>: สามารถทดลองใช้ทุกฟังก์ชัน บันทึกเลขไมล์ ค่าน้ำมัน และคุยกับช่าง AI ได้ทันที
                </span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="shrink-0 px-3 py-1 rounded-lg bg-[#1677FF] hover:bg-[#0D5FD1] text-white font-medium text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>เข้าสู่ระบบ / บันทึกถาวร</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Navbar with Vehicle Selector for Mobile & Tablet */}
        <Navbar
          bike={activeBike}
          bikes={bikes}
          onSelectBike={handleSelectBike}
          onOpenAddBikeModal={() => setIsAddVehicleModalOpen(true)}
          onOpenEditBikeModal={() => setIsEditBikeModalOpen(true)}
          userProfile={userProfile}
          onEditUserProfile={() => setActiveTab('profile')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMileageModal={() => {
            setQuickInputMileage(activeBike.currentMileage + 20);
            setIsQuickMileageModalOpen(true);
          }}
          onOpenQuickAddModal={() => {
            setQuickAddDefaultTab('fuel');
            setIsQuickAddModalOpen(true);
          }}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isOilOverdue={isOilOverdue}
          dueSoonCount={dueSoonCount}
          onLogoutClick={() => setIsGlobalLogoutDialogOpen(true)}
          session={session}
          onOpenLogin={() => setIsAuthModalOpen(true)}
        />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <DashboardOverview
            bike={activeBike}
            bikes={bikes}
            userProfile={userProfile}
            maintenanceItems={maintenanceItems}
            expenses={expenses}
            fuelRecords={fuelRecords}
            documents={documents}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenMileageModal={() => {
              setQuickInputMileage(activeBike.currentMileage + 20);
              setIsQuickMileageModalOpen(true);
            }}
            onOpenQuickAddModal={(defaultType = 'fuel') => {
              setQuickAddDefaultTab(defaultType);
              setIsQuickAddModalOpen(true);
            }}
            onOpenEditBikeModal={() => setIsEditBikeModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectMaintenanceItem={(item) => setSelectedItemDetail(item)}
            onAskAI={handleAskAI}
            onUpdateBikeQuick={handleUpdateBikeQuick}
          />
        )}

        {/* TAB 1.5: GARAGE (Requirement 32.4) */}
        {activeTab === 'garage' && (
          <GarageView
            bikes={bikes}
            activeBikeId={activeBike.id}
            onSelectBike={handleSelectBike}
            onOpenAddBikeModal={() => setIsAddVehicleModalOpen(true)}
            onOpenEditBikeModal={(b) => {
              handleSelectBike(b.id);
              setIsEditBikeModalOpen(true);
            }}
            onUpdateBikePhoto={handleUpdateBikePhoto}
            onOpenMileageModal={() => {
              setQuickInputMileage(activeBike.currentMileage + 20);
              setIsQuickMileageModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onCloudSync={() => requireAuth(() => handleCloudSync(), 'กรุณาเข้าสู่ระบบก่อนซิงค์ข้อมูลขึ้นคลาวด์ ☁️')}
            onDeleteBike={(id) => requireAuth(() => handleDeleteBike(id), 'กรุณาเข้าสู่ระบบก่อนลบรถมอเตอร์ไซค์ 🔒')}
          />
        )}

        {/* TAB 2: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <MaintenanceStatusView
            bike={activeBike}
            items={maintenanceItems}
            onServiceItem={handleServiceMaintenanceItem}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAskAI={handleAskAI}
            selectedItemModal={selectedItemDetail}
            onCloseItemModal={() => setSelectedItemDetail(null)}
          />
        )}

        {/* TAB 3: FUEL */}
        {activeTab === 'fuel' && (
          <FuelLoggerView
            bike={activeBike}
            fuelRecords={fuelRecords}
            onAddFuelRecord={handleAddFuelRecord}
            onUpdateFuelRecord={handleUpdateFuelRecord}
            onDeleteFuelRecord={handleDeleteFuelRecord}
          />
        )}

        {/* TAB 4: EXPENSES */}
        {activeTab === 'expenses' && (
          <FinancialAnalyticsView
            bike={activeBike}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {/* TAB 5: REPAIR HISTORY */}
        {activeTab === 'history' && (
          <RepairHistoryView
            bike={activeBike}
            expenses={expenses}
            onAddRepairExpense={handleAddExpense}
            onUpdateRepairExpense={handleUpdateRepairExpense}
            onDeleteExpense={handleDeleteExpense}
            onAskAI={handleAskAI}
          />
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <DocumentsView
            bike={activeBike}
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onRenewDocument={handleRenewDocument}
          />
        )}

        {/* TAB 7: AI CHAT */}
        {activeTab === 'chat' && (
          <AIChatAssistant
            bike={activeBike}
            expenses={expenses}
            maintenanceItems={maintenanceItems}
            prefilledPrompt={chatPrefillPrompt}
            onClearPrefilledPrompt={() => setChatPrefillPrompt(undefined)}
          />
        )}

        {/* TAB 8: PROFILE & USER ACCOUNT */}
        {activeTab === 'profile' && (
          <ProfileView
            session={session}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            userProfile={userProfile}
            bikes={bikes}
            expenses={expenses}
            onUpdateUserProfile={handleSaveUserProfile}
            onLogout={() => setIsGlobalLogoutDialogOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenDataBackupModal={() => setIsDataModalOpen(true)}
            showSnackbar={showSnackbar}
          />
        )}

        {/* Quick Audit Log trigger button in view */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="text-xs text-slate-500 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
          >
            <span>📜 ประวัติการเปลี่ยนแปลง ({auditLogs.length})</span>
          </button>
        </div>
      </main>

      {/* QUICK MILEAGE MODAL */}
      {isQuickMileageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#15191E] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-[#1677FF]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">จดบันทึกเลขไมล์ด่วน</h3>
              </div>
              <button
                onClick={() => setIsQuickMileageModalOpen(false)}
                className="text-slate-400 dark:text-[#A7ADB5] hover:text-slate-900 dark:hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-[#A7ADB5]">
              เลขไมล์เดิม: <strong className="text-slate-900 dark:text-white font-mono">{activeBike.currentMileage.toLocaleString()} km</strong>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                เลขไมล์ใหม่บนหน้าปัด (กม.) *
              </label>
              <input
                type="number"
                min={activeBike.currentMileage}
                value={quickInputMileage}
                onChange={(e) => setQuickInputMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0D10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xl font-bold focus:border-[#1677FF] outline-none"
              />
            </div>

            <div className="flex gap-2">
              {[15, 25, 50, 100].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setQuickInputMileage(activeBike.currentMileage + km)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0D10] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition cursor-pointer"
                >
                  +{km}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsQuickMileageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[#A7ADB5] hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  handleAddMileageLog({
                    mileage: quickInputMileage,
                    date: new Date().toISOString().split('T')[0],
                    note: 'จดไมล์ด่วน',
                    type: 'manual',
                  });
                  setIsQuickMileageModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0D5FD1] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                บันทึกเลขไมล์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL MODALS */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />

      <EditBikeModal
        bike={activeBike}
        isOpen={isEditBikeModalOpen}
        onClose={() => setIsEditBikeModalOpen(false)}
        onSave={handleUpdateBike}
        onDeleteBike={(id) => requireAuth(() => handleDeleteBike(id), 'กรุณาเข้าสู่ระบบก่อนลบรถมอเตอร์ไซค์ 🔒')}
        canDelete={bikes.length > 1}
      />

      <QuickAddModal
        bike={activeBike}
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        defaultTab={quickAddDefaultTab}
        onAddFuelRecord={handleAddFuelRecord}
        onRecordOilChange={handleRecordOilChange}
        onAddExpense={handleAddExpense}
      />

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
        onClearLogs={() => setAuditLogs([])}
      />

      <DataBackupModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        userProfile={userProfile}
        onUpdateUserProfile={handleSaveUserProfile}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* 31.9 GLOBAL LOGOUT CONFIRMATION MODAL */}
      {isGlobalLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#15191E] border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto border border-[#EF4444]/30">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-white text-base">คุณต้องการออกจากระบบหรือไม่?</h3>
              <p className="text-xs text-[#A7ADB5]">
                ระบบจะล้าง Session และนำคุณกลับสู่หน้าเข้าสู่ระบบ ข้อมูลรถของคุณยังคงถูกเก็บรักษาอย่างปลอดภัย
              </p>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsGlobalLogoutDialogOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0B0D10] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30.9 SNACKBAR NOTIFICATION WITH UNDO */}
      <SnackbarNotification
        message={snackbarMessage}
        onUndo={undoCallback}
        onClose={() => {
          setSnackbarMessage(null);
          setUndoCallback(null);
        }}
      />

      {/* AUTH MODAL (Can be opened on-demand by user or for saving securely) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto">
            <AuthView
              isModal
              onClose={() => setIsAuthModalOpen(false)}
              onContinueAsGuest={() => setIsAuthModalOpen(false)}
              onAuthSuccess={(newSession) => {
                handleAuthSuccess(newSession);
                setIsAuthModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0B0D10] text-center text-xs text-slate-500 dark:text-[#A7ADB5]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MotoCare • ระบบดูแลและจัดการข้อมูลรถมอเตอร์ไซค์ส่วนตัว (Omnichannel & PWA Ready)</span>
            <span>พื้นหลัง #0B0D10 • Card #15191E • สีหลัก #1677FF</span>
          </div>
        </footer>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (Hidden on Desktop lg:hidden) */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickAdd={() => {
          setQuickAddDefaultTab('fuel');
          setIsQuickAddModalOpen(true);
        }}
        isOilOverdue={isOilOverdue}
        dueSoonCount={dueSoonCount}
      />

      {/* Offline Mode Indicator Banner */}
      <OfflineIndicator />
    </div>
  );
}
