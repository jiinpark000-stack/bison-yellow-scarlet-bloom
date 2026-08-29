export type Role = "teacher" | "student";

export type SessionInfo =
  | { role: "teacher"; className: string; passwordChanged: boolean; vaultUnlocked: boolean }
  | {
      role: "student";
      className: string;
      student: StudentPublic;
    };

export type StudentPublic = {
  id: number;
  name: string;
  jobName: string | null;
  salary: number;
  cash: number;
  savings: number;
  lastSalaryOn: string | null;
  lastInterestOn: string | null;
  taxDue: number;
};

export type StudentRow = StudentPublic & {
  jobId: number | null;
  holdingsValue: number;
  total: number;
  donated: number;
  taxParts: { name: string; due: number }[];
  faceCount: number;
  printCount: number;
};

export type Donor = {
  studentId: number;
  name: string;
  donated: number;
};

export type TaxAppliesOn = "income" | "gain" | "snack" | "manual";
export type TaxCharge = "percent" | "fixed";

export type TaxKind = {
  id: number;
  name: string;
  appliesOn: TaxAppliesOn;
  charge: TaxCharge;
  rate: number;
  amount: number;
  isActive: boolean;
  sortOrder: number;
};

export type TaxBill = {
  id: number;
  kindId: number | null;
  kindName: string;
  amount: number;
  paid: number;
  due: number;
};

export type Job = {
  id: number;
  name: string;
  salary: number;
  sortOrder: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  sortOrder: number;
};

export type SnackOrder = {
  id: number;
  studentId: number;
  studentName: string;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  total: number;
  status: "waiting" | "done" | "refunded";
  createdAt: string;
};

export type Quote = {
  symbol: string;
  name: string;
  market: string;
  currency: string;
  realPrice: number;
  realPrevClose: number;
  gamePrice: number;
  changePercent: number;
  history: { t: number; game: number }[];
};

export type Holding = {
  symbol: string;
  name: string;
  qty: number;
  avgCost: number;
  gamePrice: number;
  changePercent: number;
  value: number;
  pnl: number;
  pnlPercent: number;
};

export type LedgerRow = {
  id: number;
  kind: string;
  amount: number;
  memo: string;
  createdAt: string;
};

export type RosterEntry = {
  id: number;
  name: string;
};

export type EventStatus = "draft" | "open" | "closed";

export type EventSignup = {
  studentId: number;
  studentName: string;
  paid: number;
  rewarded: number;
  createdAt: string;
};

export type ClassEvent = {
  id: number;
  name: string;
  description: string;
  fee: number;
  reward: number;
  status: EventStatus;
  eventOn: string | null;
  createdAt: string;
  signupCount: number;
  signups: EventSignup[];
};

export type StudentEvent = {
  id: number;
  name: string;
  description: string;
  fee: number;
  reward: number;
  status: EventStatus;
  eventOn: string | null;
  joined: boolean;
  paid: number;
  rewarded: number;
};

export const PRICE_SCALE = 1000;
export const STARTING_CASH = 1000;
export const DEFAULT_TEACHER_PASSWORD = "6505";
export const DEFAULT_SAVINGS_RATE = 5;
