import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { deliveryService } from "@/services/deliveryService";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import PageLoader from "@/components/PageLoader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  PackageCheck,
  Package,
  Truck,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

export default function DeliveryDashboard() {
  const { user, refreshUser } = useAuth();
  const { data, loading } = useFetch(() => deliveryService.getDashboard(), []);
  const { request, loading: toggling } = useRequest();

  async function toggleAvailability(checked) {
    try {
      await request(() => deliveryService.updateAvailability(checked));
      toast.success(
        checked ? "You are now available" : "You are now unavailable",
      );
      refreshUser();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading dashboard…" />;

  const d = data?.dashboard || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Delivery Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Your assignments and availability.
          </p>
        </div>
        <Card className="w-auto">
          <CardContent className="p-4 flex items-center gap-3">
            <Switch
              checked={!!user?.isAvailable}
              onCheckedChange={toggleAvailability}
              disabled={toggling}
              id="avail"
            />
            <Label
              htmlFor="avail"
              className="text-sm font-medium cursor-pointer"
            >
              {user?.isAvailable ? "Available" : "Unavailable"}
            </Label>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Assigned (Pending Pickup)"
          value={d.assigned ?? 0}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="Picked Up"
          value={d.pickedUp ?? 0}
          icon={PackageCheck}
          tone="indigo"
        />
        <StatCard
          title="Processing"
          value={d.processing ?? 0}
          icon={Package}
          tone="purple"
        />
        <StatCard
          title="Ready for Delivery"
          value={d.readyForDelivery ?? 0}
          icon={PackageCheck}
          tone="sky"
        />
        <StatCard
          title="Out for Delivery"
          value={d.outForDelivery ?? 0}
          icon={Truck}
          tone="sky"
        />
        <StatCard
          title="Delivered"
          value={d.delivered ?? 0}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
    </div>
  );
}
