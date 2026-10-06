import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import StatusTimeline from "@/components/StatusTimeline";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/OrderStatusBadge";
import SubmitButton from "@/components/SubmitButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CreditCard,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(
    () => orderService.getOrder(id),
    [id],
  );
  const { request, loading: paying } = useRequest();
  const { request: cancelReq, loading: cancelling } = useRequest();

  async function pay() {
    try {
      const res = await request(() => paymentService.initialize(id));
      const url = res?.payment?.authorizationUrl;
      if (url) window.location.href = url;
      else toast.error("No payment URL returned");
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function cancel() {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    try {
      await cancelReq(() => orderService.cancelOrder(id));
      toast.success("Order cancelled");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading order…" />;
  const order = data?.order;
  if (!order) return <EmptyState title="Order not found" />;

  const canCancel = ["pending", "pickup_assigned"].includes(order.status);
  const canPay = order.paymentStatus !== "paid" && order.status !== "cancelled";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {order.items?.map((it, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {it.itemName || it.service?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {it.quantity} {it.unit} × {formatMoney(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatMoney(it.subtotal)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery fee</span>
                <span>{formatMoney(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 font-semibold text-base">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Pickup
                </p>
                <p className="text-muted-foreground mt-1">
                  {order.pickupAddress?.addressLine},{" "}
                  {order.pickupAddress?.city}, {order.pickupAddress?.state}
                </p>
                {order.pickupAddress?.landmark && (
                  <p className="text-xs text-muted-foreground">
                    Landmark: {order.pickupAddress.landmark}
                  </p>
                )}
              </div>
              <div>
                <p className="font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Delivery
                </p>
                <p className="text-muted-foreground mt-1">
                  {order.deliveryAddress?.addressLine},{" "}
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                </p>
              </div>
            </CardContent>
          </Card>

          {(canPay || canCancel) && (
            <div className="flex flex-wrap gap-3">
              {canPay && (
                <SubmitButton loading={paying} onClick={pay}>
                  <CreditCard className="w-4 h-4" /> Pay{" "}
                  {formatMoney(order.totalAmount)}
                </SubmitButton>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  onClick={cancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    "Cancelling…"
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Cancel Order
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />{" "}
                {formatDate(order.pickupDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />{" "}
                {order.pickupTimeSlot}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />{" "}
                {order.contactPhone}
              </div>
              {order.deliveryAgent && (
                <div className="text-muted-foreground">
                  Agent: {order.deliveryAgent.name} •{" "}
                  {order.deliveryAgent.phone}
                </div>
              )}
              <div className="pt-2">
                <StatusTimeline history={order.statusHistory} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
