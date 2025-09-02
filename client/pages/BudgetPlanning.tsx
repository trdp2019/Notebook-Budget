import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import Notebook from "@/components/Notebook";
import MonthSelector from "@/components/tracker/MonthSelector";
import { getCategories, getMonth, getMonthKey, loadData, monthTotals } from "@/lib/storage";
import { formatINR } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

interface CategoryBudget {
  category: string;
  budgetAmount: number;
}

export default function BudgetPlanning() {
  const [monthKey, setMonthKey] = useState<string>(getMonthKey());
  const [categories] = useState<string[]>(getCategories());
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [version, setVersion] = useState(0); // bump when storage changes

  const data = loadData();
  const month = getMonth(data, monthKey);
  const totals = useMemo(() => monthTotals(month), [month]);

  // React to storage changes from other tabs/pages
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes("notebook-expense-tracker") || e.key.startsWith("budgets-")) {
        setVersion((v) => v + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Load/merge budgets. Seed from planned entries but avoid infinite loops by only setting when changed.
  useEffect(() => {
    const latest = loadData();
    const monthData = getMonth(latest, monthKey);

    const plannedTotals = monthData.entries
      .filter((e) => e.planned)
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    const savedBudgetsRaw = localStorage.getItem(`budgets-${monthKey}`);
    const savedBudgets: CategoryBudget[] | null = savedBudgetsRaw ? JSON.parse(savedBudgetsRaw) : null;

    const allCats = Array.from(new Set([...categories, ...Object.keys(plannedTotals), ...(savedBudgets?.map((b) => b.category) || [])]));
    const merged: CategoryBudget[] = allCats.map((cat) => {
      const saved = savedBudgets?.find((b) => b.category === cat)?.budgetAmount;
      const planned = plannedTotals[cat] || 0;
      const amount = saved && saved > 0 ? saved : planned;
      return { category: cat, budgetAmount: amount };
    });

    const current = JSON.stringify(budgets);
    const next = JSON.stringify(merged);
    if (current !== next) {
      setBudgets(merged);
      localStorage.setItem(`budgets-${monthKey}`, JSON.stringify(merged));
    }
  }, [monthKey, categories, version, budgets]);

  // Save budgets to localStorage
  const saveBudgets = (newBudgets: CategoryBudget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem(`budgets-${monthKey}`, JSON.stringify(newBudgets));
  };

  const updateBudget = (category: string, amount: number) => {
    const newBudgets = budgets.map(budget =>
      budget.category === category ? { ...budget, budgetAmount: amount } : budget
    );
    saveBudgets(newBudgets);
  };

  const addNewBudget = () => {
    if (!newBudgetCategory || !newBudgetAmount) return;
    const amount = parseFloat(newBudgetAmount);
    if (isNaN(amount)) return;

    const newBudgets = [...budgets, { category: newBudgetCategory, budgetAmount: amount }];
    saveBudgets(newBudgets);
    setNewBudgetCategory("");
    setNewBudgetAmount("");
  };

  const removeBudget = (category: string) => {
    const newBudgets = budgets.filter(budget => budget.category !== category);
    saveBudgets(newBudgets);
  };

  // Income categories
  const incomeCategories = ["Salary", "Freelance"];

  // Calculate actual spending/earning by category
  const actualAmounts = useMemo(() => {
    const allEntries = month.entries.filter(e => !e.planned);
    return allEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [month]);

  // Prepare comparison data for chart
  const comparisonData = useMemo(() => {
    return budgets.map(budget => ({
      category: budget.category,
      Budget: budget.budgetAmount,
      Actual: actualAmounts[budget.category] || 0,
      Remaining: Math.max(0, budget.budgetAmount - (actualAmounts[budget.category] || 0))
    })).filter(item => item.Budget > 0);
  }, [budgets, actualAmounts]);

  const totalBudget = budgets.reduce((sum, budget) => sum + (Number(budget.budgetAmount) || 0), 0);
  const totalSpent = Object.entries(actualAmounts)
    .filter(([category]) => !incomeCategories.includes(category))
    .reduce((sum, [, amount]) => sum + amount, 0);
  const totalEarned = Object.entries(actualAmounts)
    .filter(([category]) => incomeCategories.includes(category))
    .reduce((sum, [, amount]) => sum + amount, 0);

  return (
    <Layout headerRight={<MonthSelector value={monthKey} onChange={setMonthKey} />}>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Notebook>
            <h2 className="font-hand text-2xl mb-4 mx-auto w-max">Budget Planning</h2>
            
            {/* Budget Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4">
              <div className="text-center">
                <div className="text-2xl font-hand font-bold text-blue-600">{formatINR(totalBudget)}</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-hand font-bold text-green-600">{formatINR(totalEarned)}</div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-hand font-bold text-red-600">{formatINR(totalSpent)}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-hand font-bold ${totalEarned - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatINR(totalEarned - totalSpent)}
                </div>
                <div className="text-sm text-muted-foreground">Net</div>
              </div>
            </div>

            {/* Budget List */}
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div key={budget.category} className="grid grid-cols-12 items-center gap-2 p-2">
                  <div className="col-span-3 font-hand min-w-0 break-words whitespace-normal">{budget.category}</div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={budget.budgetAmount || ""}
                      onChange={(e) => updateBudget(budget.category, parseFloat(e.target.value) || 0)}
                      placeholder="Budget amount"
                      className="bg-transparent border-none shadow-none focus:ring-0 font-hand text-[16px]"
                    />
                  </div>
                  <div className="col-span-3 text-right font-hand mr-[30px]">
                    {incomeCategories.includes(budget.category) ? 'Earned' : 'Spent'}: {formatINR(actualAmounts[budget.category] || 0)}
                  </div>
                  <div className="col-span-2 text-right font-hand">
                    {incomeCategories.includes(budget.category) ? 'Remaining' : 'Left'}: {formatINR(Math.max(0, budget.budgetAmount - (actualAmounts[budget.category] || 0)))}
                  </div>
                  <div className="col-span-1">
                    <span className="cursor-pointer text-red-600 font-hand text-lg" onClick={() => removeBudget(budget.category)}>
                      ×
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Budget */}
            <div className="grid grid-cols-12 items-center gap-2 mt-4 p-2">
              <div className="col-span-3">
                <select
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="w-full p-2 text-sm font-hand bg-transparent focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.filter(cat => !budgets.some(b => b.category === cat)).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  step="0.01"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  placeholder="Budget amount"
                  className="bg-transparent border-none shadow-none focus:ring-0 font-hand text-[16px]"
                />
              </div>
              <div className="col-span-6 flex justify-end">
                <span className="cursor-pointer text-blue-600 underline font-hand" onClick={addNewBudget}>+ Add Budget</span>
              </div>
            </div>
          </Notebook>
        </div>

        <div className="space-y-6">
          <Notebook noMarginLines innerClassName="compact">
            <h2 className="font-hand text-2xl mb-4 mx-auto w-max">Budget vs Actual</h2>
            {comparisonData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <RTooltip formatter={(value) => formatINR(Number(value))} />
                    <Bar dataKey="Budget" fill="#3b82f6" stroke="#1e40af" strokeWidth={1} />
                    <Bar dataKey="Actual" fill="#ef4444" stroke="#b91c1c" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-hand">
                Set budgets to see comparison
              </div>
            )}
          </Notebook>
        </div>
      </div>
    </Layout>
  );
}
