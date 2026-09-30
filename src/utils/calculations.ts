import {
  MotorcycleProfile,
  MaintenanceItem,
  ExpenseRecord,
  MileageLog,
  FuelRecord,
  VehicleDocument,
} from '../types';

export interface OilChangeStatus {
  kmDrivenSinceLastChange: number;
  kmRemaining: number;
  percentUsed: number;
  status: 'good' | 'warning' | 'overdue';
  statusText: string;
  predictedDueDate: string;
  daysRemaining: number;
  nextDueMileage: number;
}

export function calculateOilStatus(bike: MotorcycleProfile): OilChangeStatus {
  const nextDueMileage = bike.lastOilChangeMileage + bike.oilChangeIntervalKm;
  const kmDriven = Math.max(0, bike.currentMileage - bike.lastOilChangeMileage);
  const kmRemaining = nextDueMileage - bike.currentMileage;
  const percentUsed = Math.min(100, Math.max(0, Math.round((kmDriven / bike.oilChangeIntervalKm) * 100)));

  const dailyKm = bike.dailyAverageKm > 0 ? bike.dailyAverageKm : 25;
  const daysRemaining = Math.max(0, Math.round(kmRemaining / dailyKm));

  const now = new Date();
  const targetDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const predictedDueDate = targetDate.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let status: 'good' | 'warning' | 'overdue' = 'good';
  let statusText = 'สภาพน้ำมันเครื่องสมบูรณ์';

  if (kmRemaining <= 0) {
    status = 'overdue';
    statusText = `เกินระยะแล้ว ${Math.abs(kmRemaining).toLocaleString()} กม.! ควรรีบเปลี่ยน`;
  } else if (kmRemaining <= 500) {
    status = 'warning';
    statusText = `ใกล้ถึงกำหนดเปลี่ยนในอีก ${kmRemaining.toLocaleString()} กม.`;
  } else {
    status = 'good';
    statusText = `ใช้งานได้อีก ${kmRemaining.toLocaleString()} กม. (~${daysRemaining} วัน)`;
  }

  return {
    kmDrivenSinceLastChange: kmDriven,
    kmRemaining,
    percentUsed,
    status,
    statusText,
    predictedDueDate,
    daysRemaining,
    nextDueMileage,
  };
}

export interface ItemHealthStatus {
  item: MaintenanceItem;
  kmDriven: number;
  kmRemaining: number;
  percentWear: number;
  urgency: 'normal' | 'due_soon' | 'overdue';
  urgencyText: string;
  nextMileage: number;
  estimatedDays: number;
}

export function calculateItemHealth(
  item: MaintenanceItem,
  currentMileage: number,
  dailyAverageKm: number
): ItemHealthStatus {
  const nextMileage = item.lastServiceMileage + item.intervalKm;
  const kmDriven = Math.max(0, currentMileage - item.lastServiceMileage);
  const kmRemaining = nextMileage - currentMileage;
  const percentWear = Math.min(100, Math.max(0, Math.round((kmDriven / item.intervalKm) * 100)));

  const dailyKm = dailyAverageKm > 0 ? dailyAverageKm : 25;
  const estimatedDays = Math.max(0, Math.round(kmRemaining / dailyKm));

  let urgency: 'normal' | 'due_soon' | 'overdue' = 'normal';
  let urgencyText = 'ปกติ';

  if (kmRemaining <= 0) {
    urgency = 'overdue';
    urgencyText = `ถึงกำหนดแล้ว (เลย ${Math.abs(kmRemaining).toLocaleString()} กม.)`;
  } else if (kmRemaining <= item.intervalKm * 0.15 || kmRemaining <= 650) {
    urgency = 'due_soon';
    urgencyText = `ใกล้ถึงกำหนด (เหลือ ${kmRemaining.toLocaleString()} กม.)`;
  } else {
    urgency = 'normal';
    urgencyText = `ปกติ (เหลือ ${kmRemaining.toLocaleString()} กม.)`;
  }

  return {
    item,
    kmDriven,
    kmRemaining,
    percentWear,
    urgency,
    urgencyText,
    nextMileage,
    estimatedDays,
  };
}

// Fuel Statistics Helper
export function calculateFuelStats(records: FuelRecord[]) {
  if (records.length === 0) {
    return {
      totalSpent: 0,
      totalLiters: 0,
      avgKmPerLiter: 0,
      avgCostPerKm: 0,
      monthSpent: 0,
      monthLiters: 0,
    };
  }

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthRecords = records.filter((r) => r.date.startsWith(currentMonthStr));

  const totalSpent = records.reduce((sum, r) => sum + r.totalCost, 0);
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const monthSpent = currentMonthRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const monthLiters = currentMonthRecords.reduce((sum, r) => sum + r.liters, 0);

  // calculate average km/L from records that have it
  const validKmPerLiters = records.filter((r) => r.kmPerLiter && r.kmPerLiter > 0);
  const avgKmPerLiter = validKmPerLiters.length > 0
    ? validKmPerLiters.reduce((sum, r) => sum + (r.kmPerLiter || 0), 0) / validKmPerLiters.length
    : 45;

  const validCostPerKm = records.filter((r) => r.costPerKm && r.costPerKm > 0);
  const avgCostPerKm = validCostPerKm.length > 0
    ? validCostPerKm.reduce((sum, r) => sum + (r.costPerKm || 0), 0) / validCostPerKm.length
    : 0.85;

  return {
    totalSpent,
    totalLiters,
    avgKmPerLiter: Math.round(avgKmPerLiter * 10) / 10,
    avgCostPerKm: Math.round(avgCostPerKm * 100) / 100,
    monthSpent,
    monthLiters: Math.round(monthLiters * 10) / 10,
  };
}

// Document status helper
export function calculateDocumentStatus(doc: VehicleDocument) {
  const now = new Date();
  const exp = new Date(doc.expiryDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'normal' | 'warning' | 'expired' = 'normal';
  let label = `เหลือ ${diffDays} วัน`;

  if (diffDays < 0) {
    status = 'expired';
    label = `หมดอายุแล้ว ${Math.abs(diffDays)} วัน!`;
  } else if (diffDays <= 30) {
    status = 'warning';
    label = `หมดอายุในอีก ${diffDays} วัน`;
  } else {
    status = 'normal';
    label = `เหลืออีก ${diffDays} วัน`;
  }

  return {
    daysRemaining: diffDays,
    status,
    label,
    formattedDate: exp.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

// Answers the 7 Instant Questions required in user's prompt
export function getSevenInstantAnswers(
  bike: MotorcycleProfile,
  expenses: ExpenseRecord[],
  fuelRecords: FuelRecord[],
  maintenanceItems: MaintenanceItem[]
) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Previous month string
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // 1. รถของฉันคืออะไร
  const answer1 = `${bike.name} (ปี ${bike.year}) ทะเบียน ${bike.plateNumber}`;

  // 2. รถวิ่งมาแล้วกี่กิโลเมตร
  const answer2 = `${bike.currentMileage.toLocaleString()} km (เฉลี่ย ${bike.dailyAverageKm} km/วัน)`;

  // 3. ถึงเวลาบำรุงรักษาอะไรหรือยัง
  const oilStatus = calculateOilStatus(bike);
  const healthList = maintenanceItems.map((item) =>
    calculateItemHealth(item, bike.currentMileage, bike.dailyAverageKm)
  );
  const overdueItems = healthList.filter((h) => h.urgency === 'overdue');
  const dueSoonItems = healthList.filter((h) => h.urgency === 'due_soon');

  let answer3 = 'ทุกชิ้นส่วนปกติ พร้อมใช้งาน';
  if (oilStatus.status === 'overdue' || overdueItems.length > 0) {
    const listNames = [
      oilStatus.status === 'overdue' ? 'น้ำมันเครื่อง' : null,
      ...overdueItems.map((h) => h.item.thaiName),
    ].filter(Boolean);
    answer3 = `🔴 ถึงกำหนดแล้ว: ${listNames.join(', ')}`;
  } else if (oilStatus.status === 'warning' || dueSoonItems.length > 0) {
    const listNames = [
      oilStatus.status === 'warning' ? 'น้ำมันเครื่อง' : null,
      ...dueSoonItems.map((h) => h.item.thaiName),
    ].filter(Boolean);
    answer3 = `🟡 ใกล้ถึงกำหนด: ${listNames.slice(0, 2).join(', ')}`;
  }

  // 4. เดือนนี้เสียค่ารถไปเท่าไร
  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const prevMonthExpenses = expenses.filter((e) => e.date.startsWith(prevMonthStr));
  const prevMonthTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  let expenseTrend = '';
  if (prevMonthTotal > 0) {
    const diff = thisMonthTotal - prevMonthTotal;
    const pct = Math.round((Math.abs(diff) / prevMonthTotal) * 100);
    expenseTrend = diff >= 0 ? `(+${pct}% จากเดือนก่อน)` : `(-${pct}% จากเดือนก่อน)`;
  }
  const answer4 = `฿${thisMonthTotal.toLocaleString()} ${expenseTrend}`;

  // 5. เติมน้ำมันไปเท่าไร
  const thisMonthFuel = fuelRecords.filter((f) => f.date.startsWith(currentMonthStr));
  const fuelTotalCost = thisMonthFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const fuelTotalLiters = thisMonthFuel.reduce((sum, f) => sum + f.liters, 0);
  const answer5 = `฿${Math.round(fuelTotalCost).toLocaleString()} (${fuelTotalLiters.toFixed(1)} ลิตร, ${thisMonthFuel.length} ครั้ง)`;

  // 6. มีรายการซ่อมอะไรล่าสุด
  const repairOrServiceExpenses = expenses
    .filter((e) => e.category === 'repair' || e.category === 'service' || e.category === 'oil')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRepair = repairOrServiceExpenses[0];
  const answer6 = latestRepair
    ? `${latestRepair.title} (${latestRepair.date} ที่ ${latestRepair.shopName || 'อู่บริการ'})`
    : 'ยังไม่มีบันทึกการซ่อมล่าสุด';

  // 7. รายการไหนกำลังจะถึงกำหนด
  const allDue = [...healthList].sort((a, b) => a.kmRemaining - b.kmRemaining);
  const closestDue = allDue[0];
  const answer7 = closestDue
    ? `${closestDue.item.thaiName} (เหลืออีก ${closestDue.kmRemaining > 0 ? closestDue.kmRemaining.toLocaleString() + ' km' : 'ถึงกำหนดแล้ว'})`
    : 'ไม่มีรายการใกล้ถึงกำหนด';

  return {
    answer1,
    answer2,
    answer3,
    answer4,
    answer5,
    answer6,
    answer7,
    oilStatus,
    overdueCount: overdueItems.length + (oilStatus.status === 'overdue' ? 1 : 0),
    dueSoonCount: dueSoonItems.length + (oilStatus.status === 'warning' ? 1 : 0),
  };
}
