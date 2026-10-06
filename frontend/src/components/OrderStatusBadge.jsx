import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_META = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  pickup_assigned: {
    label: "Pickup Assigned",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  processing: {
    label: "Processing",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  ready_for_delivery: {
    label: "Ready for Delivery",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export function OrderStatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }) {
  const map = {
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    failed: "bg-rose-100 text-rose-700 border-rose-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize",
        map[status] || "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </Badge>
  );
}
