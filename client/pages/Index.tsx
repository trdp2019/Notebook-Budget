import { useEffect, useMemo, useState } from "react";
import Notebook from "@/components/Notebook";
import MonthSelector from "@/components/tracker/MonthSelector";
import EntryList from "@/components/tracker/EntryList";
import { EntryModal } from "@/components/tracker/EntryModal";
import { getCategories, getMonth, getMonthKey, loadData, monthTotals, addEntry, updateEntry, removeEntry } from "@/lib/storage";
import type { Entry } from "@/lib/storage";
import Layout from "@/components/Layout";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

export default function Index() {
  const [monthKey, setMonthKey] = useState<string>(getMonthKey());
  const [categories, setCategories] = useState<string[]>(getCategories());
  const [version, setVersion] = useState(0); // trigger refresh when storage changes

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes("notebook-expense-tracker")) setVersion((v) => v + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setCategories(getCategories());
  }, [version]);

  const data = loadData();
  const month = getMonth(data, monthKey);
  const totals = useMemo(() => monthTotals(month), [month]);

  const sortedEntries = useMemo(() => {
    return [...month.entries].sort((a, b) => a.date.localeCompare(b.date));
  }, [month]);

  const visibleEntries = useMemo(() => sortedEntries.filter((e) => !e.planned), [sortedEntries]);
  const incomes = useMemo(() => visibleEntries.filter((e) => e.type === "income"), [visibleEntries]);
  const expenses = useMemo(() => visibleEntries.filter((e) => e.type === "expense"), [visibleEntries]);

  const onAdd = (e: Entry) => {
    addEntry(monthKey, e);
    setVersion((v) => v + 1);
  };
  const [editing, setEditing] = useState<Entry | null>(null);
  const onEdit = (e: Entry) => {
    setEditing(e);
  };
  const onDelete = (id: string) => {
    removeEntry(monthKey, id);
    setVersion((v) => v + 1);
  };

  const chartData = [
    { name: "Income", Planned: totals.income.planned, Actual: totals.income.actual },
    { name: "Expense", Planned: totals.expense.planned, Actual: totals.expense.actual },
    { name: "Net", Planned: totals.net.planned, Actual: totals.net.actual },
  ];

  return (
    <Layout headerRight={<MonthSelector value={monthKey} onChange={setMonthKey} />}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Notebook>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="font-hand text-2xl mr-auto">Entries</h2>
                <div className="flex gap-4 font-hand">
                  <EntryModal type="income" categories={categories} triggerLabel="+ Add Income" onSubmit={onAdd} />
                  <EntryModal type="expense" categories={categories} triggerLabel="+ Add Expense" onSubmit={onAdd} />
                </div>
              </div>
              <AnimatedTabs
                defaultValue="all"
                className="mt-1"
                tabs={[
                  {
                    value: "all",
                    label: "All",
                    content: (
                      <div>
                        <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-muted-foreground font-sans pb-2 mb-2">
                          <div className="col-span-2">Date</div>
                          <div className="col-span-3">Category</div>
                          <div className="col-span-4">Note</div>
                          <div className="col-span-2 text-right">Amount</div>
                          <div className="col-span-1" />
                        </div>
                        <EntryList entries={visibleEntries} onEdit={onEdit} onDelete={onDelete} />
                      </div>
                    )
                  },
                  {
                    value: "income",
                    label: "Income",
                    content: (
                      <div>
                        <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-muted-foreground font-sans pb-2 mb-2">
                          <div className="col-span-2">Date</div>
                          <div className="col-span-3">Category</div>
                          <div className="col-span-4">Note</div>
                          <div className="col-span-2 text-right">Amount</div>
                          <div className="col-span-1" />
                        </div>
                        <EntryList entries={incomes} onEdit={onEdit} onDelete={onDelete} />
                      </div>
                    )
                  },
                  {
                    value: "expense",
                    label: "Expense",
                    content: (
                      <div>
                        <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-muted-foreground font-sans pb-2 mb-2">
                          <div className="col-span-2">Date</div>
                          <div className="col-span-3">Category</div>
                          <div className="col-span-4">Note</div>
                          <div className="col-span-2 text-right">Amount</div>
                          <div className="col-span-1" />
                        </div>
                        <EntryList entries={expenses} onEdit={onEdit} onDelete={onDelete} />
                      </div>
                    )
                  }
                ]}
              />
            </Notebook>
            {editing && (
              <EntryModal
                type={editing.type}
                categories={categories}
                triggerLabel=""
                onSubmit={(e) => {
                  updateEntry(monthKey, e);
                  setEditing(null);
                  setVersion((v) => v + 1);
                }}
                initial={editing}
              />
            )}
          </div>

          <div className="space-y-8">
            <Notebook>
              <h2 className="font-hand text-2xl mb-4 mx-auto w-max">Summary</h2>
              <div className="space-y-2 font-hand">
                <div className="flex justify-between"><span>Income planned</span><span className="text-emerald-600">{formatINR(totals.income.planned)}</span></div>
                <div className="flex justify-between"><span>Income actual</span><span className="text-emerald-600">{formatINR(totals.income.actual)}</span></div>
                <div className="flex justify-between"><span>Expense planned</span><span className="text-rose-600">{formatINR(totals.expense.planned)}</span></div>
                <div className="flex justify-between"><span>Expense actual</span><span className="text-rose-600">{formatINR(totals.expense.actual)}</span></div>
                <div className="h-px bg-muted my-2" />
                <div className="flex justify-between"><span>Net planned</span><span className={totals.net.planned >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatINR(totals.net.planned)}</span></div>
                <div className="flex justify-between"><span>Net actual</span><span className={totals.net.actual >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatINR(totals.net.actual)}</span></div>
              </div>
            </Notebook>

            <Notebook>
              <h2 className="font-hand text-2xl mb-4 mx-auto w-max">Analytics</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RTooltip />
                    <Line type="monotone" dataKey="Planned" stroke="#2563eb" strokeWidth={3} />
                    <Line type="monotone" dataKey="Actual" stroke="#dc2626" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Notebook>
          </div>
        </div>
      </Layout>
  );
}
