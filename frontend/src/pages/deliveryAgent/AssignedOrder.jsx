import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch";
import { deliveryService } from "@/services/deliveryService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, ArrowRight } from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

const STATUS_OPTIONS = [
  "pickup_assigned",
  "picked_up",
  "processing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
];

export default function AssignedOrders() {
  const [status, setStatus] = useState("");
  const { data, loading } = useFetch(
    () => deliveryService.getAssignedOrders(status ? { status } : {}),
    [status],
  );

  if (loading) return <PageLoader label="Loading assignments…" />;

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-display font-semibold">My Assignments</h1>
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No assignments"
          description="Orders assigned to you will appear here."
        />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link
                  to={`/delivery/orders/${o._id}`}
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">
                      {o.customer?.name} • {o.customer?.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} • Pickup:{" "}
                      {o.pickupAddress?.addressLine}, {o.pickupAddress?.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatMoney(o.totalAmount)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
