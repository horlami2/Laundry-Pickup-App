import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { adminService } from "@/services/adminService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import StatusTimeline from "@/components/StatusTimeline";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Clock,
  User,
  Truck,
} from "lucide-react";
import { formatMoney, formatDate } from "@/utils/format";

const STATUS_OPTIONS = [
  "pending",
  "pickup_assigned",
  "picked_up",
  "processing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(
    () => adminService.getOrder(id),
    [id],
  );
  const { request, loading: acting } = useRequest();
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");
  const [newStatus, setNewStatus] = useState("");

  async function loadAgents() {
    try {
      const res = await adminService.getDeliveryAgents();
      setAgents(res.agents || []);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function doAssign() {
    if (!agentId) {
      toast.error("Select an agent");
      return;
    }
    try {
      await request(() => adminService.assignAgent(id, agentId));
      toast.success("Agent assigned");
      setAgentId("");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function doStatus() {
    if (!newStatus) return;
    try {
      await request(() => adminService.updateStatus(id, newStatus));
      toast.success("Status updated");
      setNewStatus("");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading order…" />;
  const order = data?.order;
  if (!order) return <EmptyState title="Order not found" />;

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
              <div className="flex justify-between pt-3 font-semibold text-base">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

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
                <Phone className="w-4 h-4 text-muted-foreground" />{" "}
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
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" /> Agent:{" "}
                {order.deliveryAgent
                  ? `${order.deliveryAgent.name} • ${order.deliveryAgent.phone}`
                  : "Not assigned"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Assign delivery agent</Label>
                <div className="flex gap-2">
                  <Select
                    value={agentId}
                    onValueChange={setAgentId}
                    onOpenChange={(open) => {
                      if (open && agents.length === 0) loadAgents();
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.name} — {a.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={doAssign}
                    disabled={acting || !agentId || order.deliveryAgent}
                  >
                    {acting ? "…" : "Assign"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Update status</Label>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={doStatus} disabled={acting || !newStatus}>
                    {acting ? "…" : "Update"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
