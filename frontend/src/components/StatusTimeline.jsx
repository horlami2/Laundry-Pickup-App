import { cn } from "@/lib/utils";
import { STATUS_META } from "./OrderStatusBadge";
import { formatDateTime } from "@/utils/format";

export default function StatusTimeline({ history = [] }) {
  const items = [...(history || [])].reverse();
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status updates yet.</p>
    );
  }
  return (
    <ol className="relative border-l border-border ml-2 space-y-5 pl-5">
      {items.map((h, i) => {
        const meta = STATUS_META[h.status] || { label: h.status };
        const isLatest = i === 0;
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[26px] top-0.5 w-4 h-4 rounded-full border-2 border-background",
                isLatest ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            <p className="text-sm font-medium">{meta.label}</p>
            {h.note && (
              <p className="text-sm text-muted-foreground">{h.note}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDateTime(h.changedAt || h.createdAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
