import { useFetch } from "@/hooks/useFetch";
import { adminService } from "@/services/adminService";
import StatCard from "@/components/StatCard";
import PageLoader from "@/components/PageLoader";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  Wallet,
  TrendingUp,
  PackageCheck,
} from "lucide-react";
import { formatMoney } from "@/utils/format";

export default function AdminDashboard() {
  const { data, loading } = useFetch(() => adminService.getDashboard(), []);

  if (loading) return <PageLoader label="Loading dashboard…" />;

  const d = data?.dashboard;
  const o = d?.orders || {};
  const p = d?.payments || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Business overview at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={o.total ?? 0}
          icon={ShoppingBag}
        />
        <StatCard
          title="Revenue (Paid)"
          value={formatMoney(d?.revenue)}
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          title="Customers"
          value={d?.customers ?? 0}
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Delivery Agents"
          value={d?.deliveryAgents ?? 0}
          icon={Truck}
          tone="indigo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending"
          value={o.pending ?? 0}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title="Pickup Assigned"
          value={o.pickupAssigned ?? 0}
          icon={PackageCheck}
          tone="blue"
        />
        <StatCard
          title="Picked Up"
          value={o.pickedUp ?? 0}
          icon={Package}
          tone="indigo"
        />
        <StatCard
          title="Processing"
          value={o.processing ?? 0}
          icon={Package}
          tone="purple"
        />
        <StatCard
          title="Ready for Delivery"
          value={o.readyForDelivery ?? 0}
          icon={PackageCheck}
          tone="sky"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Paid Orders"
          value={p.paid ?? 0}
          icon={Wallet}
          tone="emerald"
        />
        <StatCard
          title="Unpaid Orders"
          value={p.unpaid ?? 0}
          icon={Wallet}
          tone="amber"
        />
      </div>
    </div>
  );
}
