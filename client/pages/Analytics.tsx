import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import Notebook from "@/components/Notebook";
import MonthSelector from "@/components/tracker/MonthSelector";
import { getMonth, getMonthKey, loadData, monthTotals } from "@/lib/storage";
import { addMonths, format, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

export default function Analytics() {
  const [monthKey, setMonthKey] = useState<string>(getMonthKey());
  const data = loadData();
  const month = getMonth(data, monthKey);
  const totals = useMemo(() => monthTotals(month), [month]);

  const nextMonths = useMemo(() => {
    const base = parse(monthKey + "-01", "yyyy-MM-dd", new Date());
    const list: { label: string; plannedNet: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = addMonths(base, i);
      const key = format(d, "yyyy-MM");
      const m = getMonth(data, key);
      const t = monthTotals(m);
      list.push({ label: format(d, "MMM"), plannedNet: t.net.planned });
    }
    return list;
  }, [data, monthKey]);

  const chartData = [
    { name: "Income", Planned: totals.income.planned, Actual: totals.income.actual },
    { name: "Expense", Planned: totals.expense.planned, Actual: totals.expense.actual },
    { name: "Net", Planned: totals.net.planned, Actual: totals.net.actual },
  ];

  const categoryData = useMemo(() => {
    const expenses = month.entries.filter(e => e.type === "expense");
    const categoryTotals = expenses.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ name: category, value: amount }))
      .sort((a, b) => b.value - a.value);
  }, [month]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B", "#4ECDC4", "#45B7D1"];

  return (
    <Layout headerRight={<MonthSelector value={monthKey} onChange={setMonthKey} />}>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Notebook>
            <h2 className="font-hand text-2xl mb-4">Analytics Overview</h2>
            {/* Overview Chart */}
            <div className="h-64">
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

            {/* Category Breakdown Chart */}
            <h2 className="font-hand text-2xl mb-4 mt-8">Category Breakdown</h2>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((item, index) => {
                  const maxValue = Math.max(...categoryData.map(d => d.value));
                  const widthPercent = (item.value / maxValue) * 100;
                  const colors = ["#e74c3c", "#e67e22", "#f39c12", "#f1c40f", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad"];
                  const color = colors[index % colors.length];

                  return (
                    <div key={item.name} className="flex items-center gap-3 py-2">
                      <div className="w-20 text-sm font-hand text-right">{item.name}</div>
                      <div className="flex-1 relative">
                        <div
                          className="h-8 rounded transition-all duration-300"
                          style={{
                            backgroundColor: color,
                            width: `${widthPercent}%`,
                            minWidth: '2px'
                          }}
                        />
                      </div>
                      <div className="w-24 text-sm font-hand text-right font-semibold">
                        {formatINR(item.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-hand">
                No expenses to show
              </div>
            )}
          </Notebook>
        </div>

        <div className="space-y-8">
          <Notebook noMarginLines>
            <h2 className="font-hand text-2xl mb-4">Coming Months (Planned Net)</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nextMonths}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RTooltip />
                  <Line type="monotone" dataKey="plannedNet" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Notebook>

          <Notebook noMarginLines>
            <h2 className="font-hand text-2xl mb-4">Category Breakdown</h2>
            {categoryData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatINR(value)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value) => formatINR(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground font-hand">
                No expenses to show
              </div>
            )}
          </Notebook>
        </div>
      </div>
    </Layout>
  );
}
