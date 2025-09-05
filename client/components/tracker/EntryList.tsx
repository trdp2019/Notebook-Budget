import { Entry } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/currency";

interface Props {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export default function EntryList({ entries, onEdit, onDelete }: Props) {
  return (
    <div>
      {entries.length === 0 && (
        <div className="py-6 text-center text-muted-foreground font-hand">
          Nothing here yet. Use the buttons above to add items.
        </div>
      )}
      {entries.map((e) => (
        <div key={e.id} className="grid grid-cols-12 items-center gap-1 sm:gap-2 py-1 font-hand">
          <div className="col-span-2 text-sm opacity-80 sm:-translate-x-[72px] sm:ml-[72px] z-10 whitespace-nowrap">
            {format(parseISO(e.date), "MMM d")}
          </div>
          <div className="col-span-3 min-w-0 truncate">{e.category}</div>
          <div className="col-span-4 min-w-0 truncate">{e.note}</div>
          <div className={`col-span-2 text-right whitespace-nowrap ${e.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
          >
            {formatINR(e.amount)}
            {e.planned && <span className="ml-2 text-xs text-amber-600">(planned)</span>}
          </div>
          <div className="col-span-1 flex justify-end gap-0.5 sm:gap-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(e)} aria-label="Edit" className="h-8 w-8 md:h-10 md:w-10">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(e.id)} aria-label="Delete" className="h-8 w-8 md:h-10 md:w-10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
