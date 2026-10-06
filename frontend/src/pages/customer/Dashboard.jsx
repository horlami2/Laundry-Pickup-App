import { Link } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import StatCard from "@/components/StatCard";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

export default function CustomerDashboard() {
  const { data, loading } = useFetch(() => orderService.getDashboard(), []);

  if (loading) return <PageLoader label="Loading your dashboard…" />;

  const d = data?.dashboard;
  const o = d?.orders || {};
  const recent = d?.recentOrders || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of your laundry orders.
          </p>
        </div>
        <Button asChild>
          <Link to="/customer/order/new">
            <Plus className="w-4 h-4" /> New Order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Orders"
          value={o.total ?? 0}
          icon={ShoppingBag}
        />
        <StatCard
          title="Pending"
          value={o.pending ?? 0}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title="Processing"
          value={o.processing ?? 0}
          icon={Package}
          tone="purple"
        />
        <StatCard
          title="Out for Delivery"
          value={o.outForDelivery ?? 0}
          icon={Truck}
          tone="sky"
        />
        <StatCard
          title="Delivered"
          value={o.delivered ?? 0}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          title="Cancelled"
          value={o.cancelled ?? 0}
          icon={XCircle}
          tone="rose"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/orders">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Place your first laundry order to see it here."
              action={
                <Button asChild>
                  <Link to="/customer/order/new">New Order</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y">
              {recent.map((order) => (
                <Link
                  key={order._id}
                  to={`/customer/orders/${order._id}`}
                  className="flex items-center justify-between py-3 hover:bg-accent/50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.items
                        ?.map((i) => i.itemName || i.service?.name)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatMoney(order.totalAmount)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
