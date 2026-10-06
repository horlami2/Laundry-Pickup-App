import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const homeByRole = {
  customer: "/customer",
  admin: "/admin",
  delivery_agent: "/delivery",
};

export default function HomeRedirect() {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return null;
  return <Navigate to={homeByRole[user?.role] || "/services"} replace />;
}
