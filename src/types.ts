export type BikeType = 'scooter' | 'manual' | 'bigbike' | 'sport' | 'underbone' | 'cruiser';

export type DriveType = 'chain' | 'belt';

export interface MotorcycleProfile {
  id: string;
  name: string; // e.g. "Honda MSX 125"
  brand: string; // "Honda", "Yamaha", "Kawasaki", etc.
  model: string; // "MSX 125", "Click 160", etc.
  plateNumber: string; // "1กข 7890 กรุงเทพมหานคร"
  year: number; // 2017
  color?: string; // e.g. "แดง-ดำ"
  bikeType: BikeType;
  driveType: DriveType; // 'chain' for manual/bigbike, 'belt' for scooter
  engineCc?: number; // e.g. 125
  fuelType?: string; // e.g. "แก๊สโซฮอล์ 95"
  tankCapacityLiters: number; // e.g. 5.5
  currentMileage: number; // e.g. 12540
  dailyAverageKm: number; // e.g. 25
  oilChangeIntervalKm: number; // e.g. 3000
  recommendedOilGrade: string; // e.g. "10W-30 JASO MA" or "10W-40 JASO MB"
  lastOilChangeMileage: number; // e.g. 11900
  lastOilChangeDate: string; // "2026-07-20"
  photoUrl?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'fuel'         // น้ำมัน
  | 'oil'          // น้ำมันเครื่อง & ของเหลว
  | 'repair'       // ซ่อม
  | 'parts'        // อะไหล่
  | 'service'      // เช็คระยะ & ค่าแรง
  | 'wash'         // ล้างรถ
  | 'tax'          // ภาษี
  | 'insurance'    // ประกัน
  | 'tire'         // ยาง & ช่วงล่าง
  | 'tax_insurance'// พ.ร.บ. / ภาษี / ประกัน ( legacy compatibility )
  | 'accessories'  // ของแต่ง
  | 'other';       // อื่น ๆ

export interface ExpenseRecord {
  id: string;
  bikeId: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: ExpenseCategory;
  amount: number; // THB
  laborCost?: number; // ค่าแรง
  partsCost?: number; // ค่าอะไหล่
  mileage: number; // odometer reading at time of expense
  shopName?: string;
  notes?: string;
  receiptUrl?: string;
  isOilChange?: boolean;
}

export interface MileageLog {
  id: string;
  bikeId: string;
  date: string; // YYYY-MM-DD
  mileage: number;
  note?: string;
  tripDistance?: number;
  type: 'manual' | 'daily_commute' | 'refuel' | 'service';
}

export type MaintenanceComponentType =
  | 'engine_oil'   // 1. น้ำมันเครื่อง
  | 'brake_pads'   // 2. ผ้าเบรก
  | 'tires'        // 3. ยาง
  | 'brake_fluid'  // 4. น้ำมันเบรก
  | 'coolant'      // 5. น้ำหล่อเย็น
  | 'chain_belt'   // 6. โซ่ หรือ สายพาน
  | 'battery'      // 7. แบตเตอรี่
  | 'spark_plug'   // 8. หัวเทียน
  | 'air_filter'   // 9. ไส้กรองอากาศ
  | 'gear_oil'     // น้ำมันเฟืองท้าย (สำหรับสกู๊ตเตอร์)
  | 'custom';      // อื่นๆ

export interface MaintenanceItem {
  id: string;
  bikeId: string;
  componentType: MaintenanceComponentType;
  name: string; // e.g. "Engine Oil"
  thaiName: string; // e.g. "น้ำมันเครื่อง"
  brand?: string; // ยี่ห้ออะไหล่ e.g. "Motul", "NGK", "Michelin"
  model?: string; // รุ่นอะไหล่ e.g. "7100 10W-40", "CPR8EA-9"
  category: ExpenseCategory;
  intervalKm: number; // e.g. 3000
  intervalMonths: number; // e.g. 4
  lastServiceMileage: number;
  lastServiceDate: string;
  installedMileage?: number; // เลขไมล์ตอนติดตั้ง
  cost?: number; // ราคา
  description: string;
  notes?: string;
  urgencyLevel?: 'normal' | 'due_soon' | 'overdue';
}

export interface FuelRecord {
  id: string;
  bikeId: string;
  date: string; // YYYY-MM-DD
  gasStation: string; // ปตท., บางจาก, Shell, Caltex, PT, อื่นๆ
  fuelType: string; // แก๊สโซฮอล์ 95, แก๊สโซฮอล์ 91, E20, E85, เบนซิน 95, ดีเซล
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  isFullTank: boolean;
  tripDistance?: number; // ระยะทางตั้งแต่เติมครั้งก่อน (กม.)
  kmPerLiter?: number; // อัตราสิ้นเปลือง (km/L)
  costPerKm?: number; // ค่าใช้จ่ายต่อ กม. (บาท/กม.)
  notes?: string;
}

export type DocumentType = 'prb' | 'tax' | 'insurance' | 'license' | 'other';

export interface VehicleDocument {
  id: string;
  bikeId: string;
  type: DocumentType;
  title: string; // เช่น "พ.ร.บ. คุ้มครองผู้ประสบภัย", "ป้ายภาษีประจำปี (ป้ายวงกลม)", "ประกันภัย 2+"
  startDate?: string; // วันที่เริ่มต้น
  expiryDate: string; // YYYY-MM-DD วันหมดอายุ
  issueDate?: string;
  policyNumber?: string;
  provider?: string; // วิริยะ, ทิพย, เมืองไทย, ฯลฯ
  cost?: number;
  notes?: string;
  photoUrl?: string;
  fileUrl?: string;
}

export interface RepairShop {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  rating?: number;
  isFavorite?: boolean;
}

export interface GroundingSource {
  type: 'maps' | 'web';
  title: string;
  uri: string;
  snippet?: string;
  reviewSnippets?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingType?: 'maps' | 'search' | 'none';
  sources?: GroundingSource[];
  searchQueries?: string[];
  userLocationUsed?: {
    latitude: number;
    longitude: number;
  } | null;
  isQuotaFallback?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  preferredGasStation?: string;
  avatarUrl?: string;
  language?: 'th' | 'en';
  distanceUnit?: 'km' | 'mi';
  currency?: 'THB' | 'USD';
  createdAt?: string;
}

export interface UserAccount {
  id: string; // Unique User ID e.g. "usr_kit_1001"
  email: string;
  name: string;
  nickname?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  expiresAt: number; // Expiry timestamp
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entityType: 'bike' | 'fuel' | 'expense' | 'maintenance' | 'document' | 'profile';
  entityId?: string;
  action: 'create' | 'update' | 'delete';
  title: string;
  description: string;
  oldValue?: string;
  newValue?: string;
}

export interface UndoItem {
  id: string;
  message: string;
  undo: () => void;
}
