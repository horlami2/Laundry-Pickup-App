import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { adminService } from "@/services/adminService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
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

export default function AdminOrders() {
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    page: 1,
    limit: 10,
  });
  const { data, loading, refetch } = useFetch(
    () => adminService.getOrders(filters),
    [filters.status, filters.paymentStatus, filters.page],
  );
  const { request, loading: acting } = useRequest();
  const [agents, setAgents] = useState([]);
  const [assignOrder, setAssignOrder] = useState(null);
  const [statusOrder, setStatusOrder] = useState(null);
  const [agentId, setAgentId] = useState("");
  const [newStatus, setNewStatus] = useState("");

  async function openAssign(order) {
    try {
      const res = await adminService.getDeliveryAgents();
      setAgents(res.agents || []);
      setAssignOrder(order);
      setAgentId("");
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
      await request(() => adminService.assignAgent(assignOrder._id, agentId));
      toast.success("Agent assigned");
      setAssignOrder(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function doStatus() {
    if (!newStatus) {
      toast.error("Select a status");
      return;
    }
    try {
      await request(() =>
        adminService.updateStatus(statusOrder._id, newStatus),
      );
      toast.success("Status updated");
      setStatusOrder(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading orders…" />;

  const orders = data?.orders || data?.data || [];
  const list = Array.isArray(orders) ? orders : [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">All Orders</h1>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: v === "all" ? "" : v, page: 1 }))
          }
        >
          <SelectTrigger className="w-44">
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
        <Select
          value={filters.paymentStatus || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              paymentStatus: v === "all" ? "" : v,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {["pending", "paid", "failed", "refunded"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description="Try adjusting your filters."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((o) => (
                    <tr key={o._id} className="hover:bg-accent/40">
                      <td className="p-3">
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="font-medium hover:underline"
                        >
                          {o.customer?.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {o.customer?.email}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="p-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="p-3">
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </td>
                      <td className="p-3 font-medium whitespace-nowrap">
                        {formatMoney(o.totalAmount)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssign(o)}
                            disabled={
                              o.status !== "pending" || !!o.deliveryAgent
                            }
                          >
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setStatusOrder(o);
                              setNewStatus("");
                            }}
                          >
                            Status
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!assignOrder} onOpenChange={setAssignOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Select agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOrder(null)}>
              Cancel
            </Button>
            <Button onClick={doAssign} disabled={acting}>
              {acting ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusOrder} onOpenChange={setStatusOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>New status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOrder(null)}>
              Cancel
            </Button>
            <Button onClick={doStatus} disabled={acting || !newStatus}>
              {acting ? "Updating…" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
