import { addMonths, format, parse } from "date-fns";
import { Button } from "@/components/ui/button";

interface Props {
  value: string; // YYYY-MM
  onChange: (next: string) => void;
}

export default function MonthSelector({ value, onChange }: Props) {
  const date = parse(value + "-01", "yyyy-MM-dd", new Date());
  const fmt = (d: Date) => format(d, "yyyy-MM");

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onChange(fmt(addMonths(date, -1)))}>
        ◀
      </Button>
      <div className="font-hand text-xl min-w-[10ch] text-center select-none">{format(date, "MMMM yyyy")}</div>
      <Button variant="outline" size="sm" onClick={() => onChange(fmt(addMonths(date, 1)))}>
        ▶
      </Button>
    </div>
  );
}
