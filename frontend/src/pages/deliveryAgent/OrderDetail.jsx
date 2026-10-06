import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { deliveryService } from "@/services/deliveryService";
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
  MapPin,
  Phone,
  Calendar,
  Clock,
  User,
  Package,
} from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

const ACTIONS = {
  pickup_assigned: {
    label: "Confirm Pickup",
    action: "confirmPickup",
    icon: Package,
  },
  picked_up: {
    label: "Mark Processing",
    action: "markProcessing",
    icon: Package,
  },
  processing: {
    label: "Mark Ready for Delivery",
    action: "markReady",
    icon: Package,
  },
  ready_for_delivery: {
    label: "Mark Out for Delivery",
    action: "markOutForDelivery",
    icon: Package,
  },
  out_for_delivery: {
    label: "Mark Delivered",
    action: "markDelivered",
    icon: Package,
  },
};

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(
    () => deliveryService.getOrder(id),
    [id],
  );
  const { request, loading: acting } = useRequest();

  async function doAction(actionKey) {
    try {
      await request(() => deliveryService[actionKey](id));
      toast.success("Status updated");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading order…" />;
  const order = data?.order;
  if (!order) return <EmptyState title="Order not found" />;

  const action = ACTIONS[order.status];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Assignment Details
          </h1>
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
              <CardTitle>Customer & Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />{" "}
                {order.customer?.name} • {order.customer?.phone}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" /> Contact:{" "}
                {order.contactPhone}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />{" "}
                Pickup: {order.pickupAddress?.addressLine},{" "}
                {order.pickupAddress?.city}, {order.pickupAddress?.state}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />{" "}
                Delivery: {order.deliveryAddress?.addressLine},{" "}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
              </div>
              {order.pickupAddress?.instructions && (
                <p className="text-xs text-muted-foreground">
                  Pickup instructions: {order.pickupAddress.instructions}
                </p>
              )}
            </CardContent>
          </Card>

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
                      {it.quantity} {it.unit}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatMoney(it.subtotal)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-semibold text-base">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {action && (
            <SubmitButton
              loading={acting}
              onClick={() => doAction(action.action)}
              size="lg"
            >
              <action.icon className="w-4 h-4" /> {action.label}
            </SubmitButton>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tracking</CardTitle>
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
