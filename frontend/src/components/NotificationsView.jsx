import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCheck } from "lucide-react";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function NotificationsView() {
  const { data, loading, refetch, setData } = useFetch(
    () => notificationService.getMy(),
    [],
  );
  const { request, loading: acting } = useRequest();

  async function markAll() {
    try {
      await request(() => notificationService.markAllRead());
      toast.success("All notifications marked as read");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function markOne(id) {
    try {
      await request(() => notificationService.markRead(id));
      setData((prev) => ({
        ...prev,
        notifications: (prev?.notifications || []).map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
      }));
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading notifications…" />;

  const list = data?.notifications || data?.data || [];
  const notifications = Array.isArray(list) ? list : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            disabled={acting}
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={cn(
                "transition-colors",
                !n.isRead && "border-primary/40 bg-primary/5",
              )}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markOne(n._id)}
                    disabled={acting}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
