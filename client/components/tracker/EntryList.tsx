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
        <div key={e.id} className="grid grid-cols-12 items-start gap-2 py-1 font-hand">
          <div className="col-span-2 text-sm opacity-80 -translate-x-[72px] ml-[72px] z-10">
            {format(parseISO(e.date), "MMM d")}
          </div>
          <div className="col-span-3 min-w-0 break-words whitespace-normal">{e.category}</div>
          <div className="col-span-4 min-w-0 break-words whitespace-normal">{e.note}</div>
          <div className={`col-span-2 text-right min-w-0 break-words whitespace-normal ${e.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
            {formatINR(e.amount)}
            {e.planned && <span className="ml-2 text-xs text-amber-600">(planned)</span>}
          </div>
          <div className="col-span-1 flex justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(e)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(e.id)} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
