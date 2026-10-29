"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Building,
  Block,
  Unit,
  User,
  UserRoleAssignment,
  ChargeInvoice,
  ExpenseItem,
  OtherRevenue,
  initialBuildings,
  initialUnits,
  initialRoles,
  initialInvoices,
  initialExpenses,
  initialOtherRevenues
} from "./mockData";

interface AppContextType {
  // Authentication & Roles
  isLoggedIn: boolean;
  currentUser: User | null;
  userRoles: UserRoleAssignment[];
  currentRole: UserRoleAssignment | null;
  isLoginModalOpen: boolean;
  isNewBuildingModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsNewBuildingModalOpen: (open: boolean) => void;
  loginWithOtp: (mobile: string, code: string) => boolean;
  loginWithPassword: (mobile: string, pass: string) => boolean;
  switchRole: (role: UserRoleAssignment) => void;
  logout: () => void;
  
  // Buildings
  buildings: Building[];
  activeBuilding: Building;
  setActiveBuilding: (building: Building) => void;
  createBuilding: (data: Partial<Building> & { password?: string; managerName?: string; managerMobile?: string }) => void;

  // Units
  units: Unit[];
  addUnit: (unit: Omit<Unit, "id" | "buildingId" | "balance">) => void;
  importUnitsFromExcel: (newUnits: Omit<Unit, "id" | "buildingId" | "balance">[]) => void;

  // Invoices & Billing
  invoices: ChargeInvoice[];
  createChargeInvoice: (invoice: Omit<ChargeInvoice, "id" | "buildingId" | "items" | "totalAmount"> & { customAmounts?: Record<string, number> }) => void;
  payInvoiceItem: (invoiceId: string, unitId: string) => void;

  // Expenses
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, "id" | "buildingId">) => void;

  // Other Revenues
  otherRevenues: OtherRevenue[];
  addOtherRevenue: (revenue: Omit<OtherRevenue, "id" | "buildingId">) => void;

  // Active Manager Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "usr-admin",
    name: "امیرحسین رضایی",
    mobile: "09121112233"
  });

  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [activeBuilding, setActiveBuilding] = useState<Building>(initialBuildings[0]);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [invoices, setInvoices] = useState<ChargeInvoice[]>(initialInvoices);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [otherRevenues, setOtherRevenues] = useState<OtherRevenue[]>(initialOtherRevenues);

  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>(initialRoles);
  const [currentRole, setCurrentRole] = useState<UserRoleAssignment | null>(initialRoles[0]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Login with OTP
  const loginWithOtp = (mobile: string, code: string) => {
    // شبیه‌سازی تایید پیامک
    if (code === "1234" || code.length === 4 || code.length === 5) {
      handleSuccessfulLogin(mobile);
      return true;
    }
    return false;
  };

  // Login with Password
  const loginWithPassword = (mobile: string, pass: string) => {
    if (pass.length >= 4) {
      handleSuccessfulLogin(mobile);
      return true;
    }
    return false;
  };

  const handleSuccessfulLogin = (mobile: string) => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);

    // پیدا کردن یا ساخت کاربر
    let user = {
      id: "usr-" + mobile.slice(-4),
      name: mobile === "09121112233" ? "امیرحسین رضایی" : "کاربر " + mobile.slice(-4),
      mobile
    };
    setCurrentUser(user);

    // بررسی اینکه آیا کاربر نقش دارد یا خیر
    const matchedRoles = userRoles.filter(r => r.userId === user.id || mobile === "09121112233");
    if (matchedRoles.length > 0) {
      setUserRoles(matchedRoles);
      setCurrentRole(matchedRoles[0]);
    } else {
      // هیچ نقشی ندارد
      setUserRoles([]);
      setCurrentRole(null);
    }
  };

  const switchRole = (role: UserRoleAssignment) => {
    setCurrentRole(role);
    const targetBuilding = buildings.find(b => b.id === role.buildingId);
    if (targetBuilding) {
      setActiveBuilding(targetBuilding);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentRole(null);
  };

  // Create Building & become manager
  const createBuilding = (data: Partial<Building> & { password?: string; managerName?: string; managerMobile?: string }) => {
    const newBuildingId = "bld-" + (buildings.length + 1);
    const newBuilding: Building = {
      id: newBuildingId,
      name: data.name || "ساختمان جدید",
      province: data.province || "تهران",
      city: data.city || "تهران",
      address: data.address || "",
      phone: data.phone || "",
      postalCode: data.postalCode || "",
      type: data.type || "مسکونی",
      accountNumber: data.accountNumber || "",
      accountHolder: data.accountHolder || data.managerName || "",
      fundBalance: 0,
      blocks: data.blocks || [{ id: "blk-1", name: "بلوک اصلی", floors: 4, unitsCount: 8 }]
    };

    setBuildings(prev => [...prev, newBuilding]);
    setActiveBuilding(newBuilding);

    // ارتقای کاربر به نقش مدیر ساختمان جدید
    const newRole: UserRoleAssignment = {
      userId: currentUser?.id || "usr-new",
      buildingId: newBuildingId,
      buildingName: newBuilding.name,
      role: "مدیر ساختمان"
    };

    setUserRoles(prev => [...prev, newRole]);
    setCurrentRole(newRole);
    setIsNewBuildingModalOpen(false);
  };

  // Add single unit
  const addUnit = (unitData: Omit<Unit, "id" | "buildingId" | "balance">) => {
    const newUnit: Unit = {
      ...unitData,
      id: "u-" + Math.floor(100 + Math.random() * 900),
      buildingId: activeBuilding.id,
      balance: 0
    };
    setUnits(prev => [...prev, newUnit]);

    // اگر ساکن یا مالک کاربر جدید است، در نقش‌ها اضافه شود
    if (unitData.residentMobile) {
      const residentRole: UserRoleAssignment = {
        userId: "usr-" + unitData.residentMobile.slice(-4),
        buildingId: activeBuilding.id,
        buildingName: activeBuilding.name,
        role: unitData.residentType === "مالک و ساکن" ? "مالک و ساکن" : "مستاجر",
        unitTitle: unitData.title,
        unitId: newUnit.id
      };
      setUserRoles(prev => [...prev, residentRole]);
    }
  };

  // Import units from Excel
  const importUnitsFromExcel = (newUnitsData: Omit<Unit, "id" | "buildingId" | "balance">[]) => {
    const createdUnits: Unit[] = newUnitsData.map((data, idx) => ({
      ...data,
      id: "u-" + (100 + units.length + idx + 1),
      buildingId: activeBuilding.id,
      balance: 0
    }));

    setUnits(prev => [...prev, ...createdUnits]);
  };

  // Create Charge Invoice with Calculation Engine
  const createChargeInvoice = (data: Omit<ChargeInvoice, "id" | "buildingId" | "items" | "totalAmount"> & { customAmounts?: Record<string, number> }) => {
    // انتخاب واحدهای مشمول
    let targetList = units.filter(u => u.buildingId === activeBuilding.id);
    if (data.targetUnits === "occupied") {
      targetList = targetList.filter(u => u.isOccupied);
    } else if (data.targetUnits === "empty") {
      targetList = targetList.filter(u => !u.isOccupied);
    }

    let calculatedTotal = 0;
    const items = targetList.map(unit => {
      let amount = 0;
      const base = data.baseAmount || 0;
      const area = unit.area;
      const occupants = unit.occupants || 1;
      const areaRate = data.areaRate || 2500; // تومان به ازای هر متر
      const occupantRate = data.occupantRate || 50000; // تومان به ازای هر نفر
      const defaultCharge = unit.defaultCharge || 300000;

      switch (data.calculationModel) {
        case "FIXED_ALL":
          amount = base;
          break;
        case "DEFAULT_CHARGE":
          amount = defaultCharge;
          break;
        case "BY_AREA":
          amount = area * areaRate;
          break;
        case "BY_OCCUPANTS":
          amount = occupants * occupantRate;
          break;
        case "FIXED_AREA":
          amount = base + (area * areaRate);
          break;
        case "FIXED_OCCUPANTS":
          amount = base + (occupants * occupantRate);
          break;
        case "FIXED_AREA_OCCUPANTS":
          amount = base + (area * areaRate) + (occupants * occupantRate);
          break;
        case "DEFAULT_AREA":
          amount = defaultCharge + (area * areaRate);
          break;
        case "DEFAULT_OCCUPANTS":
          amount = defaultCharge + (occupants * occupantRate);
          break;
        case "DEFAULT_AREA_OCCUPANTS":
          amount = defaultCharge + (area * areaRate) + (occupants * occupantRate);
          break;
        default:
          amount = defaultCharge;
      }

      if (data.customAmounts && data.customAmounts[unit.id]) {
        amount = data.customAmounts[unit.id];
      }

      calculatedTotal += amount;

      return {
        unitId: unit.id,
        unitTitle: unit.title,
        residentName: unit.residentName || unit.ownerName,
        amount,
        penalty: 0,
        isPaid: false
      };
    });

    const newInvoice: ChargeInvoice = {
      ...data,
      id: "inv-" + Math.floor(100 + Math.random() * 900),
      buildingId: activeBuilding.id,
      totalAmount: calculatedTotal,
      items
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // به‌روزرسانی بدهکاری واحدها
    setUnits(prev =>
      prev.map(u => {
        const item = items.find(i => i.unitId === u.id);
        if (item) {
          return { ...u, balance: u.balance - item.amount };
        }
        return u;
      })
    );
  };

  // Pay Invoice Item
  const payInvoiceItem = (invoiceId: string, unitId: string) => {
    let paidAmount = 0;
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== invoiceId) return inv;
        return {
          ...inv,
          items: inv.items.map(item => {
            if (item.unitId === unitId && !item.isPaid) {
              paidAmount = item.amount + item.penalty;
              return {
                ...item,
                isPaid: true,
                paidAt: "امروز"
              };
            }
            return item;
          })
        };
      })
    );

    // تسویه و افزایش موجودی صندوق
    if (paidAmount > 0) {
      setBuildings(prev =>
        prev.map(b => (b.id === activeBuilding.id ? { ...b, fundBalance: b.fundBalance + paidAmount } : b))
      );
      setUnits(prev =>
        prev.map(u => (u.id === unitId ? { ...u, balance: u.balance + paidAmount } : u))
      );
    }
  };

  // Add Expense
  const addExpense = (expenseData: Omit<ExpenseItem, "id" | "buildingId">) => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: "exp-" + Math.floor(100 + Math.random() * 900),
      buildingId: activeBuilding.id
    };

    setExpenses(prev => [newExpense, ...prev]);

    // کسر از موجودی صندوق ساختمان
    setBuildings(prev =>
      prev.map(b => (b.id === activeBuilding.id ? { ...b, fundBalance: b.fundBalance - expenseData.totalAmount } : b))
    );

    // اگر "اعلام به اهالی ساختمان" باشد، واحدها بدهکار می‌شوند
    if (expenseData.settlementMethod === "اعلام به اهالی ساختمان") {
      const activeUnits = units.filter(u => u.buildingId === activeBuilding.id);
      const splitPerUnit = Math.round(expenseData.totalAmount / (activeUnits.length || 1));

      setUnits(prev =>
        prev.map(u => {
          if (u.buildingId === activeBuilding.id) {
            return { ...u, balance: u.balance - splitPerUnit };
          }
          return u;
        })
      );
    }
  };

  // Add Other Revenue
  const addOtherRevenue = (revData: Omit<OtherRevenue, "id" | "buildingId">) => {
    const newRev: OtherRevenue = {
      ...revData,
      id: "rev-" + Math.floor(100 + Math.random() * 900),
      buildingId: activeBuilding.id
    };
    setOtherRevenues(prev => [newRev, ...prev]);

    // واریز به صندوق
    setBuildings(prev =>
      prev.map(b => (b.id === activeBuilding.id ? { ...b, fundBalance: b.fundBalance + revData.amount } : b))
    );
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        userRoles,
        currentRole,
        isLoginModalOpen,
        isNewBuildingModalOpen,
        setIsLoginModalOpen,
        setIsNewBuildingModalOpen,
        loginWithOtp,
        loginWithPassword,
        switchRole,
        logout,
        buildings,
        activeBuilding,
        setActiveBuilding,
        createBuilding,
        units,
        addUnit,
        importUnitsFromExcel,
        invoices,
        createChargeInvoice,
        payInvoiceItem,
        expenses,
        addExpense,
        otherRevenues,
        addOtherRevenue,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
