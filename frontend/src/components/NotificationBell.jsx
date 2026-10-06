import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const pathByRole = {
  customer: "/customer/notifications",
  admin: "/admin/notifications",
  delivery_agent: "/delivery/notifications",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, refetch } = useFetch(
    () => notificationService.getUnreadCount(),
    [],
  );
  const count = data?.unreadCount ?? data?.count ?? 0;

  useEffect(() => {
    const id = setInterval(refetch, 30000);
    return () => clearInterval(id);
  }, [refetch]);

  if (!user) return null;

  return (
    <button
      onClick={() => navigate(pathByRole[user.role] || "/")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center",
          )}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
