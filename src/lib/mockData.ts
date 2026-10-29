export interface User {
  id: string;
  name: string;
  mobile: string;
  nationalCode?: string;
}

export interface Building {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  location?: string;
  phone: string;
  postalCode: string;
  type: "مسکونی" | "تجاری" | "اداری" | "سایر";
  accountNumber: string;
  accountHolder: string;
  blocks: Block[];
  fundBalance: number; // موجودی صندوق ساختمان
}

export interface Block {
  id: string;
  name: string;
  floors: number;
  unitsCount: number;
}

export interface Unit {
  id: string;
  buildingId: string;
  blockName?: string;
  title: string; // مثلا واحد ۱۰۱
  floor: number;
  area: number; // متراژ
  occupants: number; // تعداد نفرات
  parkingCount: number;
  storageCount: number;
  isOccupied: boolean; // پر یا خالی
  residentType: "مالک و ساکن" | "مستاجر";
  residentName: string;
  residentMobile: string;
  residentNationalCode: string;
  ownerName: string;
  ownerMobile: string;
  ownerNationalCode: string;
  defaultCharge: number; // شارژ پیش فرض (تومان)
  balance: number; // تراز مالی واحد (منفی: بدهکار، مثبت: بستانکار)
}

export interface UserRoleAssignment {
  userId: string;
  buildingId: string;
  buildingName: string;
  role: "مدیر ساختمان" | "مالک و ساکن" | "مستاجر" | "مالک غیرساکن";
  unitTitle?: string;
  unitId?: string;
}

export interface ChargeInvoice {
  id: string;
  buildingId: string;
  title: string;
  issueDate: string;
  dueDateDays: number;
  dueDate: string;
  dailyPenalty: number;
  calculationModel: 
    | "FIXED_ALL" 
    | "DEFAULT_CHARGE" 
    | "BY_AREA" 
    | "BY_OCCUPANTS" 
    | "FIXED_AREA" 
    | "FIXED_OCCUPANTS" 
    | "FIXED_AREA_OCCUPANTS" 
    | "DEFAULT_AREA" 
    | "DEFAULT_OCCUPANTS" 
    | "DEFAULT_AREA_OCCUPANTS";
  baseAmount?: number;
  areaRate?: number;
  occupantRate?: number;
  payerType: "ساکن" | "مالک" | "هر دو";
  targetUnits: "all" | "occupied" | "empty" | "custom";
  totalAmount: number;
  items: {
    unitId: string;
    unitTitle: string;
    residentName: string;
    amount: number;
    penalty: number;
    isPaid: boolean;
    paidAt?: string;
  }[];
}

export interface OtherRevenue {
  id: string;
  buildingId: string;
  title: string; // اجاره پارکینگ، تبلیغات آسانسور، فروش ضایعات
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface MeterReadingItem {
  unitId: string;
  unitTitle: string;
  prevReading: number;
  currentReading: number;
  consumption: number;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  buildingId: string;
  title: string;
  category: "آب" | "برق" | "گاز" | "تعمیرات و نگهداری" | "نظافت" | "سرویس آسانسور" | "سایر";
  calculationMethod: "کنتورخوانی" | "مساوی" | "بر اساس نفرات" | "بر اساس متراژ" | "مبلغ دلخواه";
  totalAmount: number;
  unitPrice?: number;
  date: string;
  description: string;
  payerType: "ساکن" | "مالک";
  targetUnits: "all" | "occupied" | "empty" | "custom";
  settlementMethod: "اعلام به اهالی ساختمان" | "پرداخت از صندوق بدون اعلام به اهالی";
  attachmentName?: string;
  meterReadings?: MeterReadingItem[];
}

// دیتای پیش‌فرض واقع‌گرایانه
export const initialBuildings: Building[] = [
  {
    id: "bld-1",
    name: "مجتمع مسکونی نیلوفر",
    province: "تهران",
    city: "تهران",
    address: "خیابان پاسداران، بوستان پنجم، پلاک ۲۴",
    phone: "02122889900",
    postalCode: "1668943211",
    type: "مسکونی",
    accountNumber: "6037-9918-1234-5678",
    accountHolder: "امیرحسین رضایی (مدیر ساختمان)",
    fundBalance: 34500000,
    blocks: [
      { id: "blk-1", name: "بلوک A", floors: 5, unitsCount: 10 },
      { id: "blk-2", name: "بلوک B", floors: 5, unitsCount: 10 }
    ]
  }
];

export const initialUnits: Unit[] = [
  {
    id: "u-101",
    buildingId: "bld-1",
    blockName: "بلوک A",
    title: "واحد ۱۰۱",
    floor: 1,
    area: 95,
    occupants: 3,
    parkingCount: 1,
    storageCount: 1,
    isOccupied: true,
    residentType: "مالک و ساکن",
    residentName: "علی کاظمی",
    residentMobile: "09121112233",
    residentNationalCode: "0012345678",
    ownerName: "علی کاظمی",
    ownerMobile: "09121112233",
    ownerNationalCode: "0012345678",
    defaultCharge: 450000,
    balance: -450000
  },
  {
    id: "u-102",
    buildingId: "bld-1",
    blockName: "بلوک A",
    title: "واحد ۱۰۲",
    floor: 1,
    area: 120,
    occupants: 4,
    parkingCount: 2,
    storageCount: 1,
    isOccupied: true,
    residentType: "مستاجر",
    residentName: "محمد حسینی",
    residentMobile: "09351234567",
    residentNationalCode: "0087654321",
    ownerName: "سهراب پیروز",
    ownerMobile: "09124445566",
    ownerNationalCode: "0055443322",
    defaultCharge: 550000,
    balance: 0
  },
  {
    id: "u-103",
    buildingId: "bld-1",
    blockName: "بلوک A",
    title: "واحد ۱۰۳",
    floor: 2,
    area: 85,
    occupants: 0,
    parkingCount: 1,
    storageCount: 1,
    isOccupied: false,
    residentType: "مالک و ساکن",
    residentName: "خالی",
    residentMobile: "09129998877",
    residentNationalCode: "0044332211",
    ownerName: "محسن کریمی",
    ownerMobile: "09129998877",
    ownerNationalCode: "0044332211",
    defaultCharge: 350000,
    balance: -350000
  },
  {
    id: "u-104",
    buildingId: "bld-1",
    blockName: "بلوک B",
    title: "واحد ۲۰۱",
    floor: 2,
    area: 140,
    occupants: 5,
    parkingCount: 2,
    storageCount: 1,
    isOccupied: true,
    residentType: "مالک و ساکن",
    residentName: "دکتر مهدوی",
    residentMobile: "09123334455",
    residentNationalCode: "0066778899",
    ownerName: "دکتر مهدوی",
    ownerMobile: "09123334455",
    ownerNationalCode: "0066778899",
    defaultCharge: 600000,
    balance: 150000
  }
];

export const initialRoles: UserRoleAssignment[] = [
  {
    userId: "usr-admin",
    buildingId: "bld-1",
    buildingName: "مجتمع مسکونی نیلوفر",
    role: "مدیر ساختمان"
  },
  {
    userId: "usr-admin",
    buildingId: "bld-1",
    buildingName: "مجتمع مسکونی نیلوفر",
    role: "مالک و ساکن",
    unitTitle: "واحد ۱۰۱",
    unitId: "u-101"
  },
  {
    userId: "usr-tenant",
    buildingId: "bld-1",
    buildingName: "مجتمع مسکونی نیلوفر",
    role: "مستاجر",
    unitTitle: "واحد ۱۰۲",
    unitId: "u-102"
  }
];

export const initialInvoices: ChargeInvoice[] = [
  {
    id: "inv-101",
    buildingId: "bld-1",
    title: "شارژ ماهیانه مهرماه ۱۴۰۵",
    issueDate: "۱۴۰۵/۰۷/۰۱",
    dueDateDays: 10,
    dueDate: "۱۴۰۵/۰۷/۱۱",
    dailyPenalty: 15000,
    calculationModel: "DEFAULT_CHARGE",
    payerType: "ساکن",
    targetUnits: "all",
    totalAmount: 1950000,
    items: [
      { unitId: "u-101", unitTitle: "واحد ۱۰۱", residentName: "علی کاظمی", amount: 450000, penalty: 0, isPaid: false },
      { unitId: "u-102", unitTitle: "واحد ۱۰۲", residentName: "محمد حسینی", amount: 550000, penalty: 0, isPaid: true, paidAt: "۱۴۰۵/۰۷/۰۵" },
      { unitId: "u-103", unitTitle: "واحد ۱۰۳", residentName: "خالی", amount: 350000, penalty: 45000, isPaid: false },
      { unitId: "u-104", unitTitle: "واحد ۲۰۱", residentName: "دکتر مهدوی", amount: 600000, penalty: 0, isPaid: true, paidAt: "۱۴۰۵/۰۷/۰۲" }
    ]
  }
];

export const initialExpenses: ExpenseItem[] = [
  {
    id: "exp-1",
    buildingId: "bld-1",
    title: "قبض گاز موتورخانه (کنتورخوانی)",
    category: "گاز",
    calculationMethod: "کنتورخوانی",
    totalAmount: 4200000,
    date: "۱۴۰۵/۰۷/۱۵",
    description: "گاز بهای مشترک دوره شهریور تا مهر",
    payerType: "ساکن",
    targetUnits: "occupied",
    settlementMethod: "اعلام به اهالی ساختمان",
    attachmentName: "gas_bill_oct.pdf"
  },
  {
    id: "exp-2",
    buildingId: "bld-1",
    title: "سرویس ماهیانه آسانسور و تعویض لنت ترمز",
    category: "سرویس آسانسور",
    calculationMethod: "مساوی",
    totalAmount: 2800000,
    date: "۱۴۰۵/۰۷/۲۰",
    description: "فاکتور شماره ۱۲۴ شرکت آسانسور پارس",
    payerType: "مالک",
    targetUnits: "all",
    settlementMethod: "اعلام به اهالی ساختمان",
    attachmentName: "elevator_service_factor.jpg"
  },
  {
    id: "exp-3",
    buildingId: "bld-1",
    title: "خرید مواد شوینده و لامپ‌های راهرو",
    category: "نظافت",
    calculationMethod: "مساوی",
    totalAmount: 950000,
    date: "۱۴۰۵/۰۷/۲۵",
    description: "پرداخت مستقیم از صندوق بدون تقسیم بین واحدها",
    payerType: "ساکن",
    targetUnits: "all",
    settlementMethod: "پرداخت از صندوق بدون اعلام به اهالی"
  }
];

export const initialOtherRevenues: OtherRevenue[] = [
  {
    id: "rev-1",
    buildingId: "bld-1",
    title: "اجاره پارکینگ شماره ۱۲ مهمان",
    category: "اجاره پارکینگ",
    amount: 1200000,
    date: "۱۴۰۵/۰۷/۱۰",
    description: "اجاره پارکینگ مازاد برای ماه مهر"
  },
  {
    id: "rev-2",
    buildingId: "bld-1",
    title: "فروش کارتن و ضایعات موتورخانه",
    category: "فروش ضایعات",
    amount: 450000,
    date: "۱۴۰۵/۰۷/۱۸",
    description: "تسویه با خریدار ضایعات به حساب صندوق"
  }
];
