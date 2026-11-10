export type BuildingType = "مسکونی" | "اداری" | "تجاری" | "اداری-تجاری" | "سایر";

export type RoleType = 
  | "مدیر ساختمان" 
  | "مدیر بلوک" 
  | "مالک" 
  | "ساکن / مستأجر";

export interface User {
  id: string;
  name: string;
  mobile: string;
  nationalCode?: string;
  baleUsername?: string;
}

export interface Block {
  id: string;
  buildingId: string;
  name: string;
  floorsCount: number;
  unitsCount: number;
  status: "active" | "inactive";
  managerUserId?: string;
  managerName?: string;
}

export interface UnitUserRelation {
  id: string;
  unitId: string;
  userId: string;
  userName: string;
  userMobile: string;
  userNationalCode?: string;
  relationshipType: "owner" | "resident";
  ownershipPercentage?: number; // مثلا ۱۰۰ یا ۵۰ درصد
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Unit {
  id: string;
  buildingId: string;
  blockId?: string;
  blockName?: string;
  name: string; // e.g. "واحد ۱۰۱"
  floorNumber: number;
  area: number; // متراژ (متر مربع)
  usageType: "مسکونی" | "تجاری" | "اداری";
  peopleCount: number; // تعداد ساکنین
  parkingCount: number;
  storeCount: number;
  residentialStatus: "خالی" | "مالک نشین" | "مستاجر نشین";
  defaultChargeAmount: number;
  initialBalance: number; // مانده اولیه بدهکار/بستانکار
  currentBalance: number; // مانده روز (منفی: بدهکار، مثبت: بستانکار)
  owners: UnitUserRelation[];
  residents: UnitUserRelation[];
}

export interface FinancialAccount {
  id: string;
  buildingId: string;
  name: string;
  accountType: "bank" | "cash" | "petty_cash";
  bankName?: string;
  accountNumber?: string;
  shebaNumber?: string;
  initialBalance: number;
  currentBalance: number;
  responsibleName: string;
  isActive: boolean;
}

export interface TransactionAllocation {
  id: string;
  transactionId: string;
  allocatableType: "charge_item" | "expense_item" | "other";
  allocatableId: string;
  allocatableTitle: string;
  unitTitle?: string;
  amount: number;
}

export interface Transaction {
  id: string;
  buildingId: string;
  financialAccountId: string;
  accountName: string;
  type: "receipt" | "payment" | "transfer";
  category: 
    | "دریافت شارژ" 
    | "دریافت درآمدها" 
    | "دریافت وجه علی‌الحساب" 
    | "سایر دریافت‌ها" 
    | "پرداخت هزینه" 
    | "سایر پرداخت‌ها" 
    | "انتقال بین حساب‌ها";
  amount: number;
  transactionDate: string;
  trackingNumber?: string;
  description: string;
  payerOrPayeeName: string;
  status: "confirmed" | "pending_approval" | "rejected";
  receiptAttachment?: string;
  allocations: TransactionAllocation[];
}

export interface UnitLedgerEntry {
  id: string;
  buildingId: string;
  unitId: string;
  unitTitle: string;
  entryDate: string;
  entryType: "Charge" | "expense" | "payment" | "prepayment" | "CreditConsumption" | "Refund" | "init";
  title: string;
  debitAmount: number; // بدهکار (افزایش بدهی واحد)
  creditAmount: number; // بستانکار (پرداخت یا بستانکاری)
  balanceAfter: number; // مانده تراز بعد از این سند
  referenceId?: string;
}

export interface ChargeItem {
  id: string;
  chargeId: string;
  unitId: string;
  unitTitle: string;
  payerName: string;
  payerMobile: string;
  payerType: "owner" | "resident";
  amount: number;
  fineAmount: number;
  paidAmount: number;
  settlementStatus: "unpaid" | "partially_paid" | "paid" | "overdue";
  dataSnapshot?: Record<string, any>;
}

export interface Charge {
  id: string;
  buildingId: string;
  blockId?: string;
  title: string;
  description?: string;
  issueDate: string;
  dueDate: string;
  dueDateDays?: number;
  calculationMethod: "equal" | "fixed" | "area" | "resident" | "area_resident" | "default_charge";
  status: "draft" | "issued" | "cancelled";
  fineType: "price" | "percent";
  fineAmount: number; // مبلغ روزانه یا درصد روزانه
  penaltyType?: "daily_fixed" | "daily_percentage";
  dailyPenaltyAmount?: number;
  penaltyPercentage?: number;
  payerTarget: "owners" | "residents" | "both";
  targetUnitsScope: "all" | "occupied" | "empty" | "custom";
  totalAmount: number;
  totalCollected: number;
  items: ChargeItem[];
}

export type ExpenseScenario =
  | "SCENARIO_1_PAY_THEN_SPLIT"
  | "SCENARIO_2_SPLIT_THEN_PAY"
  | "SCENARIO_3_FUND_PAY_NO_SPLIT"
  | "SCENARIO_1_FUND_PAY_THEN_SPLIT"
  | "SCENARIO_2_SPLIT_COLLECT_THEN_PAY";

export interface ExpenseMeterReading {
  id: string;
  unitId: string;
  unitTitle: string;
  previousReading?: number;
  currentReading?: number;
  previousNumber?: number;
  currentNumber?: number;
  consumption: number;
  calculatedAmount: number;
}

export type MeterReadingRecord = ExpenseMeterReading;

export interface ExpenseItem {
  id: string;
  expenseId: string;
  unitId: string;
  unitTitle: string;
  payerUserId?: string;
  payerName: string;
  amount: number;
  status: "unpaid" | "paid" | "partially_paid";
}

export interface Expense {
  id: string;
  buildingId: string;
  title: string;
  category: string;
  calculationMethod: "equal" | "area" | "resident" | "area_resident" | "meter" | "meter_consumption";
  includedScope?: "allUnit" | "allEmpty" | "NotEmpty" | "someUnit";
  targetScope?: "all" | "occupied" | "empty" | "custom";
  totalAmount: number;
  payStatus: "unpaid" | "paid" | "partially_paid" | "cancelled";
  expenseDate: string;
  payerType?: "owner" | "resident";
  payerTarget?: "residents" | "owners" | "both";
  description?: string;
  attachmentName?: string;
  scenario: ExpenseScenario;
  paidFromAccountId?: string;
  items: ExpenseItem[];
  meterReadings?: ExpenseMeterReading[];
}

export interface Income {
  id: string;
  buildingId: string;
  title: string;
  category: "اجاره پارکینگ" | "اجاره آنتن/بام" | "تبلیغات آسانسور" | "فروش ضایعات" | "سایر درآمدها";
  amount: number;
  incomeDate: string;
  description?: string;
  payerName?: string;
  receivedToAccountId?: string;
  status: "recognized" | "received"; // شناسایی شده در برابر دریافت وجه واقعی
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  province?: string;
  city?: string;
  address: string;
  postalCode: string;
  phone?: string;
  accountNumber?: string;
  accountHolder?: string;
  password?: string;
  location?: { lat: number; lng: number };
  floorsCount: number;
  unitsCount: number;
  hasBlocks: boolean;
  status: "active" | "inactive";
  managerName: string;
  managerMobile: string;
  blocks: Block[];
}

export interface RoleAssignment {
  userId: string;
  buildingId: string;
  buildingName: string;
  role: RoleType;
  blockId?: string;
  blockName?: string;
  unitId?: string;
  unitTitle?: string;
}

// ---------------------- داده‌های اولیه و واقع‌گرایانه سرابان ----------------------
export const initialBuildings: Building[] = [
  {
    id: "bld-saraban-1",
    name: "مجتمع بزرگ سرابان (پردیس)",
    type: "مسکونی",
    address: "تهران، شهرک غرب، فاز ۲، بلوار هرمزان، مجتمع پردیس",
    postalCode: "1465891234",
    location: { lat: 35.7725, lng: 51.3654 },
    floorsCount: 8,
    unitsCount: 16,
    hasBlocks: true,
    status: "active",
    managerName: "مهندس علیرضا سلیمانی",
    managerMobile: "09121112233",
    blocks: [
      { id: "blk-a", buildingId: "bld-saraban-1", name: "بلوک ارغوان (A)", floorsCount: 8, unitsCount: 8, status: "active", managerName: "مهندس کاظمی" },
      { id: "blk-b", buildingId: "bld-saraban-1", name: "بلوک بهاران (B)", floorsCount: 8, unitsCount: 8, status: "active", managerName: "دکتر حسینی" },
    ]
  }
];

export const initialFinancialAccounts: FinancialAccount[] = [
  {
    id: "acc-1",
    buildingId: "bld-saraban-1",
    name: "حساب جاری مشترک بانک ملت",
    accountType: "bank",
    bankName: "ملت",
    accountNumber: "4567891234",
    shebaNumber: "IR120120000000004567891234",
    initialBalance: 15000000,
    currentBalance: 42500000,
    responsibleName: "مهندس علیرضا سلیمانی",
    isActive: true
  },
  {
    id: "acc-2",
    buildingId: "bld-saraban-1",
    name: "صندوق نقدی هیئت مدیره",
    accountType: "cash",
    initialBalance: 5000000,
    currentBalance: 8200000,
    responsibleName: "مسئول امور مالی",
    isActive: true
  },
  {
    id: "acc-3",
    buildingId: "bld-saraban-1",
    name: "تنخواه گردان سرایدار و تعمیرات",
    accountType: "petty_cash",
    initialBalance: 3000000,
    currentBalance: 2450000,
    responsibleName: "امیر سرایدار",
    isActive: true
  }
];

export const initialUnits: Unit[] = [
  {
    id: "u-101",
    buildingId: "bld-saraban-1",
    blockId: "blk-a",
    blockName: "بلوک ارغوان (A)",
    name: "واحد ۱۰۱",
    floorNumber: 1,
    area: 110,
    usageType: "مسکونی",
    peopleCount: 3,
    parkingCount: 1,
    storeCount: 1,
    residentialStatus: "مالک نشین",
    defaultChargeAmount: 650000,
    initialBalance: 0,
    currentBalance: -650000, // بدهکار
    owners: [
      { id: "rel-1", unitId: "u-101", userId: "usr-1", userName: "علی کاظمی", userMobile: "09121112233", relationshipType: "owner", ownershipPercentage: 100, startDate: "۱۴۰۲/۰۱/۰۱", isActive: true }
    ],
    residents: [
      { id: "rel-2", unitId: "u-101", userId: "usr-1", userName: "علی کاظمی", userMobile: "09121112233", relationshipType: "resident", startDate: "۱۴۰۲/۰۱/۰۱", isActive: true }
    ]
  },
  {
    id: "u-102",
    buildingId: "bld-saraban-1",
    blockId: "blk-a",
    blockName: "بلوک ارغوان (A)",
    name: "واحد ۱۰۲",
    floorNumber: 1,
    area: 135,
    usageType: "مسکونی",
    peopleCount: 4,
    parkingCount: 2,
    storeCount: 1,
    residentialStatus: "مستاجر نشین",
    defaultChargeAmount: 780000,
    initialBalance: 0,
    currentBalance: 0, // تسویه
    owners: [
      { id: "rel-3", unitId: "u-102", userId: "usr-owner-2", userName: "مهندس سهراب پیروز", userMobile: "09124445566", relationshipType: "owner", ownershipPercentage: 100, startDate: "۱۴۰۱/۰۵/۱۵", isActive: true }
    ],
    residents: [
      { id: "rel-4", unitId: "u-102", userId: "usr-tenant-2", userName: "محمد حسینی (مستأجر)", userMobile: "09351234567", relationshipType: "resident", startDate: "۱۴۰۴/۰۴/۰۱", endDate: "۱۴۰۵/۰۴/۰۱", isActive: true }
    ]
  },
  {
    id: "u-103",
    buildingId: "bld-saraban-1",
    blockId: "blk-a",
    blockName: "بلوک ارغوان (A)",
    name: "واحد ۱۰۳",
    floorNumber: 2,
    area: 95,
    usageType: "مسکونی",
    peopleCount: 0,
    parkingCount: 1,
    storeCount: 1,
    residentialStatus: "خالی",
    defaultChargeAmount: 450000,
    initialBalance: 0,
    currentBalance: -450000,
    owners: [
      { id: "rel-5", unitId: "u-103", userId: "usr-owner-3", userName: "فرزاد نادری", userMobile: "09127778899", relationshipType: "owner", ownershipPercentage: 100, startDate: "۱۴۰۳/۱۰/۰۱", isActive: true }
    ],
    residents: []
  },
  {
    id: "u-201",
    buildingId: "bld-saraban-1",
    blockId: "blk-b",
    blockName: "بلوک بهاران (B)",
    name: "واحد ۲۰۱",
    floorNumber: 2,
    area: 145,
    usageType: "مسکونی",
    peopleCount: 5,
    parkingCount: 2,
    storeCount: 1,
    residentialStatus: "مالک نشین",
    defaultChargeAmount: 850000,
    initialBalance: 150000, // بستانکار
    currentBalance: 150000,
    owners: [
      { id: "rel-6", unitId: "u-201", userId: "usr-owner-4", userName: "دکتر مهدوی", userMobile: "09123334455", relationshipType: "owner", ownershipPercentage: 50, startDate: "۱۴۰۰/۰۱/۰۱", isActive: true },
      { id: "rel-7", unitId: "u-201", userId: "usr-owner-5", userName: "خانم دکتر فلاحی", userMobile: "09123334456", relationshipType: "owner", ownershipPercentage: 50, startDate: "۱۴۰۰/۰۱/۰۱", isActive: true }
    ],
    residents: [
      { id: "rel-8", unitId: "u-201", userId: "usr-owner-4", userName: "دکتر مهدوی", userMobile: "09123334455", relationshipType: "resident", startDate: "۱۴۰۰/۰۱/۰۱", isActive: true }
    ]
  }
];

export const initialCharges: Charge[] = [
  {
    id: "chg-101",
    buildingId: "bld-saraban-1",
    title: "شارژ ماهیانه آبان‌ماه ۱۴۰۵",
    issueDate: "۱۴۰۵/۰۸/۰۱",
    dueDate: "۱۴۰۵/۰۸/۱۵",
    calculationMethod: "area_resident",
    status: "issued",
    fineType: "price",
    fineAmount: 25000, // ۲۵ هزار تومان به ازای هر روز تاخیر
    payerTarget: "residents",
    targetUnitsScope: "all",
    totalAmount: 2730000,
    totalCollected: 780000,
    items: [
      { id: "ci-1", chargeId: "chg-101", unitId: "u-101", unitTitle: "واحد ۱۰۱", payerName: "علی کاظمی", payerMobile: "09121112233", payerType: "resident", amount: 650000, fineAmount: 0, paidAmount: 0, settlementStatus: "unpaid" },
      { id: "ci-2", chargeId: "chg-101", unitId: "u-102", unitTitle: "واحد ۱۰۲", payerName: "محمد حسینی (مستأجر)", payerMobile: "09351234567", payerType: "resident", amount: 780000, fineAmount: 0, paidAmount: 780000, settlementStatus: "paid" },
      { id: "ci-3", chargeId: "chg-101", unitId: "u-103", unitTitle: "واحد ۱۰۳", payerName: "فرزاد نادری", payerMobile: "09127778899", payerType: "owner", amount: 450000, fineAmount: 0, paidAmount: 0, settlementStatus: "unpaid" },
      { id: "ci-4", chargeId: "chg-101", unitId: "u-201", unitTitle: "واحد ۲۰۱", payerName: "دکتر مهدوی", payerMobile: "09123334455", payerType: "resident", amount: 850000, fineAmount: 0, paidAmount: 0, settlementStatus: "unpaid" },
    ]
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    buildingId: "bld-saraban-1",
    title: "قبض گاز مشترک موتورخانه (کنتورخوانی دوره مهر)",
    category: "قبض گاز",
    calculationMethod: "meter",
    includedScope: "NotEmpty",
    totalAmount: 4850000,
    payStatus: "paid",
    expenseDate: "۱۴۰۵/۰۸/۰۴",
    payerType: "resident",
    scenario: "SCENARIO_1_PAY_THEN_SPLIT",
    paidFromAccountId: "acc-1",
    description: "پرداخت قبض گاز از حساب ملت و صدور سهم برای هر واحد بر اساس مصرف کنتور",
    attachmentName: "gas_bill_oct.pdf",
    items: [],
    meterReadings: [
      { id: "mr-1", unitId: "u-101", unitTitle: "واحد ۱۰۱", previousReading: 210, currentReading: 255, consumption: 45, calculatedAmount: 1455000 },
      { id: "mr-2", unitId: "u-102", unitTitle: "واحد ۱۰۲", previousReading: 340, currentReading: 395, consumption: 55, calculatedAmount: 1778000 },
      { id: "mr-3", unitId: "u-201", unitTitle: "واحد ۲۰۱", previousReading: 410, currentReading: 460, consumption: 50, calculatedAmount: 1617000 },
    ]
  },
  {
    id: "exp-2",
    buildingId: "bld-saraban-1",
    title: "سرویس دوره‌ای آسانسور بلوک ارغوان",
    category: "سرویس آسانسور",
    calculationMethod: "equal",
    includedScope: "allUnit",
    totalAmount: 3200000,
    payStatus: "unpaid",
    expenseDate: "۱۴۰۵/۰۸/۰۷",
    payerType: "owner",
    scenario: "SCENARIO_2_SPLIT_THEN_PAY",
    description: "ابتدا سهم مالکین محاسبه و اعلام می‌شود، سپس پس از وصول پرداخت خواهد شد",
    items: [
      { id: "ei-1", expenseId: "exp-2", unitId: "u-101", unitTitle: "واحد ۱۰۱", payerName: "علی کاظمی", amount: 1066000, status: "unpaid" },
      { id: "ei-2", expenseId: "exp-2", unitId: "u-102", unitTitle: "واحد ۱۰۲", payerName: "سهراب پیروز (مالک)", amount: 1066000, status: "unpaid" },
      { id: "ei-3", expenseId: "exp-2", unitId: "u-103", unitTitle: "واحد ۱۰۳", payerName: "فرزاد نادری (مالک)", amount: 1068000, status: "unpaid" },
    ]
  },
  {
    id: "exp-3",
    buildingId: "bld-saraban-1",
    title: "خرید لامپ‌های سنسوردار و مواد ضدعفونی",
    category: "نظافت",
    calculationMethod: "equal",
    includedScope: "allUnit",
    totalAmount: 850000,
    payStatus: "paid",
    expenseDate: "۱۴۰۵/۰۸/۰۹",
    payerType: "resident",
    scenario: "SCENARIO_3_FUND_PAY_NO_SPLIT",
    paidFromAccountId: "acc-3",
    description: "پرداخت مستقیم از تنخواه گردان بدون صدور صورتحساب برای واحدها",
    items: []
  }
];

export const initialIncomes: Income[] = [
  {
    id: "inc-1",
    buildingId: "bld-saraban-1",
    title: "اجاره پارکینگ مهمان شماره ۱۴",
    category: "اجاره پارکینگ",
    amount: 1500000,
    incomeDate: "۱۴۰۵/۰۸/۰۱",
    description: "اجاره ماه آبان پارکینگ مهمان",
    status: "received"
  },
  {
    id: "inc-2",
    buildingId: "bld-saraban-1",
    title: "فروش کارتن و ضایعات موتورخانه",
    category: "فروش ضایعات",
    amount: 600000,
    incomeDate: "۱۴۰۵/۰۸/۰۵",
    description: "تسویه با خریدار ضایعات",
    status: "received"
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    buildingId: "bld-saraban-1",
    financialAccountId: "acc-1",
    accountName: "حساب جاری مشترک بانک ملت",
    type: "receipt",
    category: "دریافت شارژ",
    amount: 780000,
    transactionDate: "۱۴۰۵/۰۸/۰۳",
    trackingNumber: "847291",
    description: "واریز اینترنتی شارژ آبان واحد ۱۰۲",
    payerOrPayeeName: "محمد حسینی (مستأجر)",
    status: "confirmed",
    allocations: [
      { id: "al-1", transactionId: "tx-1", allocatableType: "charge_item", allocatableId: "ci-2", allocatableTitle: "شارژ آبان‌ماه ۱۴۰۵", unitTitle: "واحد ۱۰۲", amount: 780000 }
    ]
  },
  {
    id: "tx-2",
    buildingId: "bld-saraban-1",
    financialAccountId: "acc-1",
    accountName: "حساب جاری مشترک بانک ملت",
    type: "payment",
    category: "پرداخت هزینه",
    amount: 4850000,
    transactionDate: "۱۴۰۵/۰۸/۰۴",
    trackingNumber: "918234",
    description: "پرداخت قبض گاز موتورخانه",
    payerOrPayeeName: "شرکت گاز استان تهران",
    status: "confirmed",
    allocations: []
  },
  {
    id: "tx-3",
    buildingId: "bld-saraban-1",
    financialAccountId: "acc-1",
    accountName: "حساب جاری مشترک بانک ملت",
    type: "receipt",
    category: "دریافت درآمدها",
    amount: 1500000,
    transactionDate: "۱۴۰۵/۰۸/۰۱",
    trackingNumber: "627189",
    description: "واریز اجاره پارکینگ مهمان",
    payerOrPayeeName: "آقای رضوانی",
    status: "confirmed",
    allocations: []
  }
];

export const initialLedgerEntries: UnitLedgerEntry[] = [
  {
    id: "led-1",
    buildingId: "bld-saraban-1",
    unitId: "u-101",
    unitTitle: "واحد ۱۰۱",
    entryDate: "۱۴۰۵/۰۸/۰۱",
    entryType: "Charge",
    title: "شارژ ماهیانه آبان‌ماه ۱۴۰۵",
    debitAmount: 650000,
    creditAmount: 0,
    balanceAfter: -650000
  },
  {
    id: "led-2",
    buildingId: "bld-saraban-1",
    unitId: "u-102",
    unitTitle: "واحد ۱۰۲",
    entryDate: "۱۴۰۵/۰۸/۰۱",
    entryType: "Charge",
    title: "شارژ ماهیانه آبان‌ماه ۱۴۰۵",
    debitAmount: 780000,
    creditAmount: 0,
    balanceAfter: -780000
  },
  {
    id: "led-3",
    buildingId: "bld-saraban-1",
    unitId: "u-102",
    unitTitle: "واحد ۱۰۲",
    entryDate: "۱۴۰۵/۰۸/۰۳",
    entryType: "payment",
    title: "پرداخت شارژ آبان‌ماه - فیش پیگیری 847291",
    debitAmount: 0,
    creditAmount: 780000,
    balanceAfter: 0
  }
];

export const initialRoleAssignments: RoleAssignment[] = [
  {
    userId: "usr-manager",
    buildingId: "bld-saraban-1",
    buildingName: "مجتمع بزرگ سرابان",
    role: "مدیر ساختمان"
  },
  {
    userId: "usr-block-mgr",
    buildingId: "bld-saraban-1",
    buildingName: "مجتمع بزرگ سرابان",
    role: "مدیر بلوک",
    blockId: "blk-a",
    blockName: "بلوک ارغوان (A)"
  },
  {
    userId: "usr-owner-1",
    buildingId: "bld-saraban-1",
    buildingName: "مجتمع بزرگ سرابان",
    role: "مالک",
    unitId: "u-101",
    unitTitle: "واحد ۱۰۱ (مالک ۱۰۰٪)"
  },
  {
    userId: "usr-tenant-2",
    buildingId: "bld-saraban-1",
    buildingName: "مجتمع بزرگ سرابان",
    role: "ساکن / مستأجر",
    unitId: "u-102",
    unitTitle: "واحد ۱۰۲ (مستأجر)"
  }
];
