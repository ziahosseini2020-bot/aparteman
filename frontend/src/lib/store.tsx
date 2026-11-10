"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Building,
  Block,
  Unit,
  User,
  RoleAssignment,
  RoleType,
  FinancialAccount,
  Transaction,
  UnitLedgerEntry,
  Charge,
  ChargeItem,
  Expense,
  Income,
  initialBuildings,
  initialFinancialAccounts,
  initialUnits,
  initialCharges,
  initialExpenses,
  initialIncomes,
  initialTransactions,
  initialLedgerEntries,
  initialRoleAssignments,
} from "./mockData";

interface AppContextType {
  // Authentication & Roles
  isLoggedIn: boolean;
  currentUser: User | null;
  userRoles: RoleAssignment[];
  currentRole: RoleAssignment;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isNewBuildingModalOpen: boolean;
  setIsNewBuildingModalOpen: (open: boolean) => void;
  switchRole: (role: RoleAssignment) => void;
  loginWithOtp: (mobile: string, code: string) => boolean;
  loginWithPassword: (mobile: string, pass: string) => boolean;
  logout: () => void;

  // Buildings & Blocks
  buildings: Building[];
  activeBuilding: Building;
  setActiveBuilding: (bld: Building) => void;
  createBuilding: (data: Partial<Building>) => void;
  createBlock: (name: string, floorsCount: number, unitsCount: number, managerName?: string) => void;

  // Units & Ownership
  units: Unit[];
  addUnit: (unit: Partial<Unit> & { ownerName?: string; ownerMobile?: string; residentName?: string; residentMobile?: string; isOwnerResident?: boolean }) => void;
  importUnitsExcel: (items: any[]) => void;

  // Charges
  charges: Charge[];
  createCharge: (chargeData: Omit<Charge, "id" | "buildingId" | "totalAmount" | "totalCollected" | "items">) => void;

  // Expenses & 3 Scenarios
  expenses: Expense[];
  createExpense: (expenseData: Omit<Expense, "id" | "buildingId" | "items" | "meterReadings"> & { meterReadings?: any[] }) => void;
  payExpenseFromFund: (expenseId: string, accountId: string) => void;

  // Incomes
  incomes: Income[];
  addIncome: (incomeData: Omit<Income, "id" | "buildingId">) => void;

  // Financial Accounts & Transactions
  accounts: FinancialAccount[];
  transactions: Transaction[];
  addTransaction: (txData: Omit<Transaction, "id" | "buildingId">) => void;
  approvePendingTransaction: (txId: string) => void;

  // Unit Ledger
  ledgerEntries: UnitLedgerEntry[];

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Bale Notification Simulation
  baleNotifications: { id: string; time: string; text: string; recipient: string }[];
  sendBaleNotification: (recipient: string, text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "usr-manager",
    name: "مهندس علیرضا سلیمانی",
    mobile: "09121112233",
    baleUsername: "@soleimani_manager"
  });

  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [activeBuilding, setActiveBuilding] = useState<Building>(initialBuildings[0]);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(initialFinancialAccounts);
  const [charges, setCharges] = useState<Charge[]>(initialCharges);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [ledgerEntries, setLedgerEntries] = useState<UnitLedgerEntry[]>(initialLedgerEntries);

  const [userRoles, setUserRoles] = useState<RoleAssignment[]>(initialRoleAssignments);
  const [currentRole, setCurrentRole] = useState<RoleAssignment>(initialRoleAssignments[0]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [baleNotifications, setBaleNotifications] = useState([
    { id: "bn-1", time: "۱۴۰۵/۰۸/۰۱ ۱۱:۳۰", text: "قبض شارژ آبان‌ماه با موفقیت در ربات بله برای ساکنین ارسال شد.", recipient: "اهالی ساختمان" },
    { id: "bn-2", time: "۱۴۰۵/۰۸/۰۳ ۱۸:۴۵", text: "تایید پرداخت شارژ واحد ۱۰۲ از طریق درگاه بله انجام شد.", recipient: "محمد حسینی" },
  ]);

  const sendBaleNotification = (recipient: string, text: string) => {
    const newNotif = {
      id: "bn-" + Date.now(),
      time: "لحظاتی پیش",
      text,
      recipient
    };
    setBaleNotifications(prev => [newNotif, ...prev]);
  };

  const loginWithOtp = (mobile: string, code: string) => {
    if (code === "1234" || code.length >= 4) {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const loginWithPassword = (mobile: string, pass: string) => {
    if (mobile && pass && pass.length >= 4) {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchRole = (role: RoleAssignment) => {
    setCurrentRole(role);
    const targetBuilding = buildings.find(b => b.id === role.buildingId);
    if (targetBuilding) setActiveBuilding(targetBuilding);
  };

  // Add Block
  const createBlock = (name: string, floorsCount: number, unitsCount: number, managerName?: string) => {
    const newBlock: Block = {
      id: "blk-" + (activeBuilding.blocks.length + 1),
      buildingId: activeBuilding.id,
      name,
      floorsCount,
      unitsCount,
      status: "active",
      managerName: managerName || "مشخص نشده"
    };

    setBuildings(prev =>
      prev.map(b => b.id === activeBuilding.id ? { ...b, blocks: [...b.blocks, newBlock], hasBlocks: true } : b)
    );
    setActiveBuilding(prev => ({ ...prev, blocks: [...prev.blocks, newBlock], hasBlocks: true }));
  };

  // Create Building
  const createBuilding = (data: Partial<Building>) => {
    const newBld: Building = {
      id: "bld-" + (buildings.length + 1),
      name: data.name || "ساختمان جدید",
      type: data.type || "مسکونی",
      address: data.address || "",
      postalCode: data.postalCode || "",
      floorsCount: data.floorsCount || 4,
      unitsCount: data.unitsCount || 8,
      hasBlocks: data.hasBlocks || false,
      status: "active",
      managerName: currentUser?.name || "مدیر",
      managerMobile: currentUser?.mobile || "09121112233",
      blocks: data.blocks || []
    };

    setBuildings(prev => [...prev, newBld]);
    setActiveBuilding(newBld);

    // Initial default bank account
    const newAccount: FinancialAccount = {
      id: "acc-" + (accounts.length + 1),
      buildingId: newBld.id,
      name: "حساب جاری ساختمان",
      accountType: "bank",
      initialBalance: 0,
      currentBalance: 0,
      responsibleName: newBld.managerName,
      isActive: true
    };
    setAccounts(prev => [...prev, newAccount]);

    const newRole: RoleAssignment = {
      userId: currentUser?.id || "usr-new",
      buildingId: newBld.id,
      buildingName: newBld.name,
      role: "مدیر ساختمان"
    };
    setUserRoles(prev => [...prev, newRole]);
    setCurrentRole(newRole);
  };

  // Add Unit
  const addUnit = (unitData: Partial<Unit> & { ownerName?: string; ownerMobile?: string; residentName?: string; residentMobile?: string; isOwnerResident?: boolean }) => {
    const newUnitId = "u-" + (units.length + 101);
    const isOwnerRes = unitData.isOwnerResident !== false;

    const owners = unitData.ownerName ? [{
      id: "rel-o-" + Date.now(),
      unitId: newUnitId,
      userId: "usr-o-" + Date.now(),
      userName: unitData.ownerName,
      userMobile: unitData.ownerMobile || "",
      relationshipType: "owner" as const,
      ownershipPercentage: 100,
      startDate: "۱۴۰۵/۰۱/۰۱",
      isActive: true
    }] : [];

    const residents = isOwnerRes ? owners : (unitData.residentName ? [{
      id: "rel-r-" + Date.now(),
      unitId: newUnitId,
      userId: "usr-r-" + Date.now(),
      userName: unitData.residentName,
      userMobile: unitData.residentMobile || "",
      relationshipType: "resident" as const,
      startDate: "۱۴۰۵/۰۱/۰۱",
      isActive: true
    }] : []);

    const newUnit: Unit = {
      id: newUnitId,
      buildingId: activeBuilding.id,
      blockId: unitData.blockId,
      blockName: unitData.blockName,
      name: unitData.name || "واحد " + (units.length + 1),
      floorNumber: unitData.floorNumber || 1,
      area: unitData.area || 100,
      usageType: unitData.usageType || "مسکونی",
      peopleCount: unitData.peopleCount || 2,
      parkingCount: unitData.parkingCount || 1,
      storeCount: unitData.storeCount || 1,
      residentialStatus: unitData.residentialStatus || (isOwnerRes ? "مالک نشین" : "مستاجر نشین"),
      defaultChargeAmount: unitData.defaultChargeAmount || 500000,
      initialBalance: unitData.initialBalance || 0,
      currentBalance: unitData.initialBalance || 0,
      owners,
      residents
    };

    setUnits(prev => [...prev, newUnit]);

    // Initial Ledger if there is an opening balance
    if (unitData.initialBalance && unitData.initialBalance !== 0) {
      const isDebt = unitData.initialBalance < 0;
      setLedgerEntries(prev => [
        {
          id: "led-" + Date.now(),
          buildingId: activeBuilding.id,
          unitId: newUnitId,
          unitTitle: newUnit.name,
          entryDate: "امروز",
          entryType: "init",
          title: "ثبت مانده اولیه واحد در سامانه",
          debitAmount: isDebt ? Math.abs(unitData.initialBalance!) : 0,
          creditAmount: !isDebt ? unitData.initialBalance! : 0,
          balanceAfter: unitData.initialBalance!
        },
        ...prev
      ]);
    }
  };

  const importUnitsExcel = (items: any[]) => {
    items.forEach((item, idx) => {
      addUnit({
        name: item.title,
        blockName: item.blockName,
        area: item.area,
        floorNumber: item.floor,
        peopleCount: item.occupants,
        defaultChargeAmount: item.defaultCharge,
        ownerName: item.ownerName,
        ownerMobile: item.ownerMobile,
        residentName: item.residentName,
        residentMobile: item.residentMobile,
        isOwnerResident: item.residentType === "مالک و ساکن"
      });
    });
  };

  // Create Charge
  const createCharge = (data: Omit<Charge, "id" | "buildingId" | "totalAmount" | "totalCollected" | "items">) => {
    let targetUnitsList = units.filter(u => u.buildingId === activeBuilding.id);
    if (currentRole.role === "مدیر بلوک" && currentRole.blockId) {
      targetUnitsList = targetUnitsList.filter(u => u.blockId === currentRole.blockId);
    }
    if (data.targetUnitsScope === "occupied") {
      targetUnitsList = targetUnitsList.filter(u => u.residentialStatus !== "خالی");
    } else if (data.targetUnitsScope === "empty") {
      targetUnitsList = targetUnitsList.filter(u => u.residentialStatus === "خالی");
    }

    let calculatedTotal = 0;
    const newItems: ChargeItem[] = targetUnitsList.map(unit => {
      let amount = 0;
      const area = unit.area;
      const occupants = unit.peopleCount || 1;
      const defaultCharge = unit.defaultChargeAmount || 400000;

      switch (data.calculationMethod) {
        case "equal":
          amount = 500000;
          break;
        case "fixed":
          amount = 600000;
          break;
        case "area":
          amount = area * 5000;
          break;
        case "resident":
          amount = occupants * 150000;
          break;
        case "area_resident":
          // ترکیبی با وزن‌دهی
          amount = (area * 3000) + (occupants * 100000);
          break;
        case "default_charge":
          amount = defaultCharge;
          break;
        default:
          amount = defaultCharge;
      }

      calculatedTotal += amount;
      const payer = unit.residents[0] || unit.owners[0];

      return {
        id: "ci-" + Math.floor(Math.random() * 100000),
        chargeId: "",
        unitId: unit.id,
        unitTitle: unit.name,
        payerName: payer ? payer.userName : "نامشخص",
        payerMobile: payer ? payer.userMobile : "",
        payerType: data.payerTarget === "owners" ? "owner" : "resident",
        amount,
        fineAmount: 0,
        paidAmount: 0,
        settlementStatus: "unpaid"
      };
    });

    const newChargeId = "chg-" + Date.now();
    const finalItems = newItems.map(item => ({ ...item, chargeId: newChargeId }));

    const newCharge: Charge = {
      ...data,
      id: newChargeId,
      buildingId: activeBuilding.id,
      totalAmount: calculatedTotal,
      totalCollected: 0,
      items: finalItems
    };

    setCharges(prev => [newCharge, ...prev]);

    // Update Unit Ledgers & Balances (Rule: Charge generates debit for the unit)
    finalItems.forEach(item => {
      setUnits(prev => prev.map(u => u.id === item.unitId ? { ...u, currentBalance: u.currentBalance - item.amount } : u));
      setLedgerEntries(prev => [
        {
          id: "led-" + Math.floor(Math.random() * 100000),
          buildingId: activeBuilding.id,
          unitId: item.unitId,
          unitTitle: item.unitTitle,
          entryDate: "امروز",
          entryType: "Charge",
          title: `قبض شارژ: ${data.title}`,
          debitAmount: item.amount,
          creditAmount: 0,
          balanceAfter: (units.find(u => u.id === item.unitId)?.currentBalance || 0) - item.amount,
          referenceId: newChargeId
        },
        ...prev
      ]);
    });

    sendBaleNotification("اهالی ساختمان", `قبض شارژ جدید با عنوان «${data.title}» برای ${finalItems.length} واحد صادر شد.`);
  };

  // Create Expense (supporting 3 Scenarios)
  const createExpense = (expenseData: Omit<Expense, "id" | "buildingId" | "items" | "meterReadings"> & { meterReadings?: any[] }) => {
    const newExpenseId = "exp-" + Date.now();
    const activeUnits = units.filter(u => u.buildingId === activeBuilding.id);

    // Items calculation if split
    const items = expenseData.scenario !== "SCENARIO_3_FUND_PAY_NO_SPLIT" ? activeUnits.map(u => ({
      id: "ei-" + Math.floor(Math.random() * 100000),
      expenseId: newExpenseId,
      unitId: u.id,
      unitTitle: u.name,
      payerName: u.residents[0]?.userName || u.owners[0]?.userName || "اهالی",
      amount: Math.round(expenseData.totalAmount / (activeUnits.length || 1)),
      status: "unpaid" as const
    })) : [];

    const newExpense: Expense = {
      ...expenseData,
      id: newExpenseId,
      buildingId: activeBuilding.id,
      items,
      meterReadings: expenseData.meterReadings || []
    };

    setExpenses(prev => [newExpense, ...prev]);

    // If Scenario 1 (Paid first from fund) or Scenario 3 (Paid directly without splitting)
    if (expenseData.paidFromAccountId) {
      payExpenseFromFund(newExpenseId, expenseData.paidFromAccountId);
    }

    // If Scenario 1 or 2 (Splitting cost to units)
    if (expenseData.scenario !== "SCENARIO_3_FUND_PAY_NO_SPLIT") {
      items.forEach(item => {
        setUnits(prev => prev.map(u => u.id === item.unitId ? { ...u, currentBalance: u.currentBalance - item.amount } : u));
        setLedgerEntries(prev => [
          {
            id: "led-" + Math.floor(Math.random() * 100000),
            buildingId: activeBuilding.id,
            unitId: item.unitId,
            unitTitle: item.unitTitle,
            entryDate: "امروز",
            entryType: "expense",
            title: `سهم هزینه: ${expenseData.title}`,
            debitAmount: item.amount,
            creditAmount: 0,
            balanceAfter: (units.find(u => u.id === item.unitId)?.currentBalance || 0) - item.amount,
            referenceId: newExpenseId
          },
          ...prev
        ]);
      });
    }
  };

  const payExpenseFromFund = (expenseId: string, accountId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;

    // Deduct from Financial Account
    setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, currentBalance: acc.currentBalance - exp.totalAmount } : acc));
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, payStatus: "paid", paidFromAccountId: accountId } : e));

    // Record Real Transaction
    const account = accounts.find(a => a.id === accountId);
    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      buildingId: activeBuilding.id,
      financialAccountId: accountId,
      accountName: account?.name || "حساب ساختمان",
      type: "payment",
      category: "پرداخت هزینه",
      amount: exp.totalAmount,
      transactionDate: "امروز",
      description: `پرداخت هزینه ${exp.title}`,
      payerOrPayeeName: "پیمانکار / شرکت خدمات",
      status: "confirmed",
      allocations: []
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Add Income
  const addIncome = (incomeData: Omit<Income, "id" | "buildingId">) => {
    const newInc: Income = {
      ...incomeData,
      id: "inc-" + Date.now(),
      buildingId: activeBuilding.id
    };
    setIncomes(prev => [newInc, ...prev]);
  };

  // Real Transactions (Receipt / Payment / Transfer)
  const addTransaction = (txData: Omit<Transaction, "id" | "buildingId">) => {
    const newTxId = "tx-" + Date.now();
    const newTx: Transaction = {
      ...txData,
      id: newTxId,
      buildingId: activeBuilding.id
    };

    setTransactions(prev => [newTx, ...prev]);

    // If confirmed, update account balance
    if (newTx.status === "confirmed") {
      applyTransactionToBalance(newTx);
    }
  };

  const applyTransactionToBalance = (tx: Transaction) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== tx.financialAccountId) return acc;
      if (tx.type === "receipt") return { ...acc, currentBalance: acc.currentBalance + tx.amount };
      if (tx.type === "payment") return { ...acc, currentBalance: acc.currentBalance - tx.amount };
      return acc;
    }));

    // If allocation to charge item
    tx.allocations.forEach(alloc => {
      if (alloc.allocatableType === "charge_item") {
        setCharges(prev => prev.map(chg => ({
          ...chg,
          totalCollected: chg.totalCollected + alloc.amount,
          items: chg.items.map(it => it.id === alloc.allocatableId ? {
            ...it,
            paidAmount: it.paidAmount + alloc.amount,
            settlementStatus: it.paidAmount + alloc.amount >= it.amount ? "paid" : "partially_paid"
          } : it)
        })));

        // Update Unit Balance & Ledger
        const targetUnit = units.find(u => u.name === alloc.unitTitle);
        if (targetUnit) {
          setUnits(prev => prev.map(u => u.id === targetUnit.id ? { ...u, currentBalance: u.currentBalance + alloc.amount } : u));
          setLedgerEntries(prev => [
            {
              id: "led-" + Math.floor(Math.random() * 100000),
              buildingId: activeBuilding.id,
              unitId: targetUnit.id,
              unitTitle: targetUnit.name,
              entryDate: "امروز",
              entryType: "payment",
              title: `واریز و تسویه: ${alloc.allocatableTitle}`,
              debitAmount: 0,
              creditAmount: alloc.amount,
              balanceAfter: targetUnit.currentBalance + alloc.amount,
              referenceId: tx.id
            },
            ...prev
          ]);
        }
      }
    });
  };

  const approvePendingTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status === "confirmed") return;

    const updated = { ...tx, status: "confirmed" as const };
    setTransactions(prev => prev.map(t => t.id === txId ? updated : t));
    applyTransactionToBalance(updated);
    sendBaleNotification(tx.payerOrPayeeName, `تراکنش واریز مبلغ ${new Intl.NumberFormat("fa-IR").format(tx.amount)} تومان توسط مدیر تایید گردید.`);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        userRoles,
        currentRole,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isNewBuildingModalOpen,
        setIsNewBuildingModalOpen,
        switchRole,
        loginWithOtp,
        loginWithPassword,
        logout,
        buildings,
        activeBuilding,
        setActiveBuilding,
        createBuilding,
        createBlock,
        units,
        addUnit,
        importUnitsExcel,
        charges,
        createCharge,
        expenses,
        createExpense,
        payExpenseFromFund,
        incomes,
        addIncome,
        accounts,
        transactions,
        addTransaction,
        approvePendingTransaction,
        ledgerEntries,
        activeTab,
        setActiveTab,
        baleNotifications,
        sendBaleNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
