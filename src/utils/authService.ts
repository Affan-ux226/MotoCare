import { UserAccount, UserSession, UserProfile, MotorcycleProfile, MaintenanceItem, FuelRecord, ExpenseRecord, VehicleDocument, MileageLog, AuditLog } from '../types';
import { initialUserProfile, initialBikes, initialMaintenanceItems, initialFuelRecords, initialExpenses, initialDocuments, initialMileageLogs } from '../data/initialData';

const USERS_STORAGE_KEY = 'motocare_users_accounts_v2';
const SESSION_STORAGE_KEY = 'motocare_current_session_v2';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper for cryptographic hashing using Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::motocare_secure_salt::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return 'sess_' + Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Default demo account
const DEMO_USER_ID = 'usr_kit_1001';
const DEMO_EMAIL = 'rider.kit@motocare.app';
const DEMO_PASS = 'motocare123';
const DEMO_SALT = 'motocare_demo_salt_9988';

// Get all stored accounts
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse users DB:', e);
    return [];
  }
}

// Save accounts to storage
function saveAllUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Initialize seed demo user if not present
export async function ensureDemoUserInitialized(): Promise<void> {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === DEMO_EMAIL.toLowerCase());
  
  if (!existing) {
    const passwordHash = await hashPassword(DEMO_PASS, DEMO_SALT);
    const demoUser: UserAccount = {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: initialUserProfile.name,
      nickname: initialUserProfile.nickname || 'แบงค์',
      phoneNumber: initialUserProfile.phoneNumber || '081-234-5678',
      avatarUrl: initialUserProfile.avatarUrl,
      passwordHash,
      salt: DEMO_SALT,
      createdAt: '2026-01-15T10:00:00.000Z',
    };
    users.push(demoUser);
    saveAllUsers(users);

    // Also seed user's data under user ID if not already present
    seedUserDataIfEmpty(DEMO_USER_ID);
  }
}

// Seed initial data for a specific user ID
export function seedUserDataIfEmpty(userId: string): void {
  const bikesKey = getUserKey(userId, 'bikes');
  if (!localStorage.getItem(bikesKey)) {
    localStorage.setItem(bikesKey, JSON.stringify(initialBikes));
    localStorage.setItem(getUserKey(userId, 'active_bike_id'), initialBikes[0].id);
    localStorage.setItem(getUserKey(userId, 'items'), JSON.stringify(initialMaintenanceItems));
    localStorage.setItem(getUserKey(userId, 'fuel'), JSON.stringify(initialFuelRecords));
    localStorage.setItem(getUserKey(userId, 'expenses'), JSON.stringify(initialExpenses));
    localStorage.setItem(getUserKey(userId, 'documents'), JSON.stringify(initialDocuments));
    localStorage.setItem(getUserKey(userId, 'logs'), JSON.stringify(initialMileageLogs));
    localStorage.setItem(getUserKey(userId, 'audit'), JSON.stringify([]));
    localStorage.setItem(getUserKey(userId, 'profile'), JSON.stringify({
      ...initialUserProfile,
      id: userId,
    }));
  }
}

// User-Specific Storage Keys
export function getUserKey(userId: string, dataType: string): string {
  return `motocare_${userId}_${dataType}_v2`;
}

// Data Loaders and Savers by User ID
export function loadUserBikes(userId: string): MotorcycleProfile[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'bikes'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserBikes(userId: string, bikes: MotorcycleProfile[]): void {
  localStorage.setItem(getUserKey(userId, 'bikes'), JSON.stringify(bikes));
}

export function loadUserActiveBikeId(userId: string, fallbackId: string): string {
  const saved = localStorage.getItem(getUserKey(userId, 'active_bike_id'));
  return saved || fallbackId;
}

export function saveUserActiveBikeId(userId: string, bikeId: string): void {
  localStorage.setItem(getUserKey(userId, 'active_bike_id'), bikeId);
}

export function loadUserMaintenanceItems(userId: string): MaintenanceItem[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'items'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserMaintenanceItems(userId: string, items: MaintenanceItem[]): void {
  localStorage.setItem(getUserKey(userId, 'items'), JSON.stringify(items));
}

export function loadUserFuelRecords(userId: string): FuelRecord[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'fuel'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserFuelRecords(userId: string, records: FuelRecord[]): void {
  localStorage.setItem(getUserKey(userId, 'fuel'), JSON.stringify(records));
}

export function loadUserExpenses(userId: string): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'expenses'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserExpenses(userId: string, expenses: ExpenseRecord[]): void {
  localStorage.setItem(getUserKey(userId, 'expenses'), JSON.stringify(expenses));
}

export function loadUserDocuments(userId: string): VehicleDocument[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'documents'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserDocuments(userId: string, docs: VehicleDocument[]): void {
  localStorage.setItem(getUserKey(userId, 'documents'), JSON.stringify(docs));
}

export function loadUserMileageLogs(userId: string): MileageLog[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'logs'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserMileageLogs(userId: string, logs: MileageLog[]): void {
  localStorage.setItem(getUserKey(userId, 'logs'), JSON.stringify(logs));
}

export function loadUserAuditLogs(userId: string): AuditLog[] {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'audit'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUserAuditLogs(userId: string, logs: AuditLog[]): void {
  localStorage.setItem(getUserKey(userId, 'audit'), JSON.stringify(logs));
}

export function loadUserProfile(userId: string, fallback: UserProfile): UserProfile {
  try {
    const raw = localStorage.getItem(getUserKey(userId, 'profile'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveUserProfile(userId: string, profile: UserProfile): void {
  localStorage.setItem(getUserKey(userId, 'profile'), JSON.stringify(profile));
}

// Session Management
export function getCurrentSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    
    // Check if session has expired
    if (!session.expiresAt || Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    // Verify user still exists
    const users = getAllUsers();
    const userExists = users.some((u) => u.id === session.userId);
    if (!userExists) {
      clearSession();
      return null;
    }

    return session;
  } catch (e) {
    console.error('Session validation error:', e);
    clearSession();
    return null;
  }
}

export function createSession(user: UserAccount): UserSession {
  const session: UserSession = {
    token: generateToken(),
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Alias for clearSession
export const clearCurrentSession = clearSession;

// Clear all storage records for a specific user ID (e.g. 'guest' or deleted user)
export function clearUserData(userId: string): void {
  const keys = ['bikes', 'active_bike_id', 'items', 'fuel', 'expenses', 'documents', 'logs', 'audit', 'profile'];
  keys.forEach((key) => {
    localStorage.removeItem(getUserKey(userId, key));
  });
}

// Authentication API: Login
export async function loginUser(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string; session?: UserSession; user?: UserAccount }> {
  await ensureDemoUserInitialized();

  const trimmedEmail = emailInput.trim().toLowerCase();
  const trimmedPass = passwordInput;

  // 31.3 Validations
  if (!trimmedEmail) {
    return { success: false, error: 'กรุณากรอก Email' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'กรุณากรอกรหัสผ่าน' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: 'กรุณากรอก Email ให้ถูกต้อง' };
  }

  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

  if (!user) {
    // 31.3 Security: Never specify whether email or password was wrong
    return { success: false, error: 'Email หรือรหัสผ่านไม่ถูกต้อง' };
  }

  const computedHash = await hashPassword(trimmedPass, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Email หรือรหัสผ่านไม่ถูกต้อง' };
  }

  // Create session
  const session = createSession(user);
  return { success: true, session, user };
}

// Authentication API: Register
export async function registerUser(
  name: string,
  emailInput: string,
  passwordInput: string,
  confirmPasswordInput: string
): Promise<{ success: boolean; error?: string; session?: UserSession; user?: UserAccount }> {
  await ensureDemoUserInitialized();

  const trimmedName = name.trim();
  const trimmedEmail = emailInput.trim().toLowerCase();
  const trimmedPass = passwordInput;
  const trimmedConfirm = confirmPasswordInput;

  if (!trimmedName) {
    return { success: false, error: 'กรุณากรอกชื่อของคุณ' };
  }
  if (!trimmedEmail) {
    return { success: false, error: 'กรุณากรอก Email' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: 'กรุณากรอก Email ให้ถูกต้อง' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'กรุณากรอกรหัสผ่าน' };
  }
  if (trimmedPass.length < 6) {
    return { success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
  }
  if (trimmedPass !== trimmedConfirm) {
    return { success: false, error: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' };
  }

  const users = getAllUsers();
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'Email นี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น' };
  }

  // Create new user account
  const salt = generateSalt();
  const passwordHash = await hashPassword(trimmedPass, salt);
  const newUserId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newUser: UserAccount = {
    id: newUserId,
    email: trimmedEmail,
    name: trimmedName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  // Initialize new user with their initial profile & a starter motorcycle
  const starterBike: MotorcycleProfile = {
    id: `bike-${Date.now()}`,
    name: 'รถมอเตอร์ไซค์คันโปรด',
    brand: 'Honda',
    model: 'Wave 110i',
    plateNumber: '1กข 1234 กทม.',
    year: 2024,
    bikeType: 'underbone',
    driveType: 'chain',
    engineCc: 110,
    tankCapacityLiters: 5.0,
    currentMileage: 1000,
    dailyAverageKm: 20,
    oilChangeIntervalKm: 3000,
    recommendedOilGrade: '10W-30 JASO MA',
    lastOilChangeMileage: 0,
    lastOilChangeDate: new Date().toISOString().split('T')[0],
    color: 'สีน้ำเงิน-ดำ',
  };

  saveUserBikes(newUserId, [starterBike]);
  saveUserActiveBikeId(newUserId, starterBike.id);
  saveUserProfile(newUserId, {
    id: newUserId,
    name: trimmedName,
    email: trimmedEmail,
    preferredGasStation: 'ปตท. (PTT Station)',
    createdAt: newUser.createdAt,
  });
  saveUserMaintenanceItems(newUserId, [
    {
      id: `item-${Date.now()}-1`,
      bikeId: starterBike.id,
      componentType: 'engine_oil',
      name: 'Engine Oil',
      thaiName: 'น้ำมันเครื่อง (10W-30)',
      category: 'oil',
      intervalKm: 3000,
      intervalMonths: 3,
      lastServiceMileage: 0,
      lastServiceDate: new Date().toISOString().split('T')[0],
      description: 'เปลี่ยนถ่ายน้ำมันเครื่องทุก 3,000 กม.',
    },
    {
      id: `item-${Date.now()}-2`,
      bikeId: starterBike.id,
      componentType: 'brake_pads',
      name: 'Brake Pads',
      thaiName: 'ผ้าเบรกหน้า-หลัง',
      category: 'repair',
      intervalKm: 8000,
      intervalMonths: 12,
      lastServiceMileage: 0,
      lastServiceDate: new Date().toISOString().split('T')[0],
      description: 'ตรวจเช็คผ้าเบรกเพื่อความปลอดภัย',
    },
  ]);
  saveUserFuelRecords(newUserId, []);
  saveUserExpenses(newUserId, []);
  saveUserDocuments(newUserId, []);
  saveUserMileageLogs(newUserId, []);
  saveUserAuditLogs(newUserId, [
    {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityType: 'profile',
      action: 'create',
      title: 'สร้างบัญชีผู้ใช้ใหม่',
      description: `สมัครสมาชิกเรียบร้อย: ${trimmedEmail}`,
    },
  ]);

  // Create session automatically
  const session = createSession(newUser);
  return { success: true, session, user: newUser };
}

// Authentication API: Change Password
export async function changePassword(
  userId: string,
  oldPass: string,
  newPass: string,
  confirmNewPass: string
): Promise<{ success: boolean; error?: string }> {
  if (!oldPass) return { success: false, error: 'กรุณากรอกรหัสผ่านปัจจุบัน' };
  if (!newPass) return { success: false, error: 'กรุณากรอกรหัสผ่านใหม่' };
  if (newPass.length < 6) return { success: false, error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
  if (newPass !== confirmNewPass) return { success: false, error: 'รหัสผ่านใหม่และยืนยันไม่ตรงกัน' };

  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'ไม่พบผู้ใช้ในระบบ' };

  const user = users[index];
  const oldHash = await hashPassword(oldPass, user.salt);
  if (oldHash !== user.passwordHash) {
    return { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPass, newSalt);

  users[index] = {
    ...user,
    salt: newSalt,
    passwordHash: newHash,
  };
  saveAllUsers(users);

  return { success: true };
}

// Authentication API: Delete Account
export async function deleteUserAccount(
  userId: string,
  passwordConfirm: string
): Promise<{ success: boolean; error?: string }> {
  if (!passwordConfirm) {
    return { success: false, error: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการลบบัญชี' };
  }

  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้' };
  }

  const hash = await hashPassword(passwordConfirm, user.salt);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง ไม่สามารถลบบัญชีได้' };
  }

  // Remove user from database
  const updatedUsers = users.filter((u) => u.id !== userId);
  saveAllUsers(updatedUsers);

  // Permanently delete all associated data keys
  const keysToRemove = [
    getUserKey(userId, 'bikes'),
    getUserKey(userId, 'active_bike_id'),
    getUserKey(userId, 'items'),
    getUserKey(userId, 'fuel'),
    getUserKey(userId, 'expenses'),
    getUserKey(userId, 'documents'),
    getUserKey(userId, 'logs'),
    getUserKey(userId, 'audit'),
    getUserKey(userId, 'profile'),
  ];
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // Clear session
  clearSession();

  return { success: true };
}

// Demo account helper for quick login
export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASS,
  name: 'กิตติศักดิ์ (แบงค์)',
  userId: DEMO_USER_ID,
};
