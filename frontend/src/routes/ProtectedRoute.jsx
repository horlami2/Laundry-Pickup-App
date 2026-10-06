import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";

export default function ProtectedRoute() {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) return <PageLoader label="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
