import { Link } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus } from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

export default function MyOrders() {
  const { data, loading } = useFetch(() => orderService.getMyOrders(), []);

  if (loading) return <PageLoader label="Loading your orders…" />;

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">My Orders</h1>
        <Button asChild>
          <Link to="/customer/order/new">
            <Plus className="w-4 h-4" /> New Order
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Place your first laundry order to see it here."
          action={
            <Button asChild>
              <Link to="/customer/order/new">New Order</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link
                  to={`/customer/orders/${o._id}`}
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">
                      {o.items
                        ?.map((i) => i.itemName || i.service?.name)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} • {o.pickupTimeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PaymentStatusBadge status={o.paymentStatus} />
                    <OrderStatusBadge status={o.status} />
                    <span className="font-semibold">
                      {formatMoney(o.totalAmount)}
                    </span>
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
