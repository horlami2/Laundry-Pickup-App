import { useSyncExternalStore } from "react";
import Spinner from "@/components/Spinner";
import {
  getActiveRequestCount,
  subscribeToRequestActivity,
} from "@/services/apiClient";

const getServerSnapshot = () => 0;

export default function NetworkActivity() {
  const activeRequests = useSyncExternalStore(
    subscribeToRequestActivity,
    getActiveRequestCount,
    getServerSnapshot,
  );

  if (activeRequests === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed left-1/2 top-3 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-sm text-foreground shadow-sm"
    >
      <Spinner size={16} className="text-primary" />
      <span>Loading...</span>
    </div>
  );
}
