import { format } from "date-fns";

export type EntryType = "income" | "expense";

export interface Entry {
  id: string;
  type: EntryType;
  date: string; // ISO date
  category: string;
  note: string;
  amount: number;
  planned: boolean; // true = planned budget item
}

export interface MonthData {
  month: string; // YYYY-MM
  entries: Entry[];
}

export interface SettingsData {
  categories: string[];
}

export interface AppData {
  months: Record<string, MonthData>;
  settings: SettingsData;
}

const STORAGE_KEY = "notebook-expense-tracker-v1";

function defaultCategories(): string[] {
  return [
    "Salary",
    "Freelance",
    "Food",
    "Rent",
    "Transport",
    "Utilities",
    "Entertainment",
    "Health",
    "Savings",
    "Misc",
  ];
}

function createEmptyMonth(month: string): MonthData {
  return { month, entries: [] };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { months: {}, settings: { categories: defaultCategories() } };
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.settings) parsed.settings = { categories: defaultCategories() };
    if (!parsed.months) parsed.months = {};
    return parsed;
  } catch {
    return { months: {}, settings: { categories: defaultCategories() } };
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getMonthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function getMonth(data: AppData, month: string): MonthData {
  return data.months[month] ?? createEmptyMonth(month);
}

export function upsertMonth(month: MonthData) {
  const data = loadData();
  data.months[month.month] = month;
  saveData(data);
}

export function addEntry(monthKey: string, entry: Entry) {
  const data = loadData();
  const month = data.months[monthKey] ?? createEmptyMonth(monthKey);
  month.entries = [entry, ...month.entries];
  data.months[monthKey] = month;
  saveData(data);
}

export function updateEntry(monthKey: string, entry: Entry) {
  const data = loadData();
  const month = data.months[monthKey] ?? createEmptyMonth(monthKey);
  month.entries = month.entries.map((e) => (e.id === entry.id ? entry : e));
  data.months[monthKey] = month;
  saveData(data);
}

export function removeEntry(monthKey: string, id: string) {
  const data = loadData();
  const month = data.months[monthKey] ?? createEmptyMonth(monthKey);
  month.entries = month.entries.filter((e) => e.id !== id);
  data.months[monthKey] = month;
  saveData(data);
}

export function setCategories(categories: string[]) {
  const data = loadData();
  data.settings.categories = categories;
  saveData(data);
}

export function getCategories(): string[] {
  return loadData().settings.categories;
}

export function monthTotals(month: MonthData) {
  const totals = month.entries.reduce(
    (acc, e) => {
      if (e.type === "income") {
        acc.income.actual += e.planned ? 0 : e.amount;
        acc.income.planned += e.planned ? e.amount : 0;
      } else {
        acc.expense.actual += e.planned ? 0 : e.amount;
        acc.expense.planned += e.planned ? e.amount : 0;
      }
      return acc;
    },
    {
      income: { planned: 0, actual: 0 },
      expense: { planned: 0, actual: 0 },
    },
  );
  const net = {
    planned: totals.income.planned - totals.expense.planned,
    actual: totals.income.actual - totals.expense.actual,
  };
  return { ...totals, net };
}
