import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Entry, EntryType } from "@/lib/storage";
import { addEntry } from "@/lib/storage";
import { addMonths, format, parseISO } from "date-fns";

interface Props {
  type: EntryType;
  categories: string[];
  triggerLabel: string;
  onSubmit: (entry: Entry) => void;
  initial?: Entry | null;
}

export function EntryModal({ type, categories, triggerLabel, onSubmit, initial }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(initial?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "Misc");
  const [note, setNote] = useState(initial?.note ?? "");
  const [amountStr, setAmountStr] = useState(
    initial?.amount != null ? String(initial.amount) : ""
  );
  const [planned, setPlanned] = useState(initial?.planned ?? false);
  const [recurring, setRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState("1");

  useEffect(() => {
    if (initial && !open) setOpen(true);
    if (open && initial) {
      setDate(initial.date);
      setCategory(initial.category);
      setNote(initial.note);
      setAmountStr(String(initial.amount ?? ""));
      setPlanned(initial.planned);
    }
    if (open && !initial) {
      setDate(format(new Date(), "yyyy-MM-dd"));
      setCategory(categories[0] ?? "Misc");
      setNote("");
      setAmountStr("");
      setPlanned(false);
    }
  }, [open, initial, categories]);

  const title = useMemo(() => (initial ? `Edit ${type}` : `Add ${type}`), [initial, type]);

  const handleSubmit = () => {
    const parsed = parseFloat(amountStr);
    if (!category || !date || Number.isNaN(parsed)) return;
    const baseDate = parseISO(date);
    const months = Math.max(1, parseInt(recurringMonths || "1", 10));

    const first: Entry = {
      id: initial?.id ?? crypto.randomUUID(),
      type,
      date,
      category,
      note,
      amount: parsed,
      planned,
    };
    onSubmit(first);

    for (let i = 1; recurring && i < months; i++) {
      const nextDate = addMonths(baseDate, i);
      const next: Entry = {
        id: crypto.randomUUID(),
        type,
        date: format(nextDate, "yyyy-MM-dd"),
        category,
        note,
        amount: parsed,
        planned,
      };
      const monthKey = format(nextDate, "yyyy-MM");
      addEntry(monthKey, next);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <span className={`cursor-pointer underline font-hand ${type === "income" ? "text-blue-600" : "text-red-600"}`}>
            {triggerLabel}
          </span>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-hand text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 font-hand">
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="col-span-1">Date</Label>
            <Input className="col-span-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="col-span-1">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="col-span-1">Note</Label>
            <Input className="col-span-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Details" />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label className="col-span-1">Amount</Label>
            <Input className="col-span-2" type="number" step="0.01" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} />
          </div>
          <label className="flex items-center gap-3">
            <Checkbox checked={planned} onCheckedChange={(v) => setPlanned(Boolean(v))} />
            Planned (budget)
          </label>
          {planned && (
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="col-span-1">Recurring</Label>
              <div className="col-span-2 flex items-center gap-3">
                <Checkbox checked={recurring} onCheckedChange={(v) => setRecurring(Boolean(v))} />
                {recurring && (
                  <>
                    <span className="font-hand">for</span>
                    <Input
                      className="w-20"
                      type="number"
                      min={1}
                      step="1"
                      value={recurringMonths}
                      onChange={(e) => setRecurringMonths(e.target.value)}
                    />
                    <span className="font-hand">months</span>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{initial ? "Save" : "Add"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
