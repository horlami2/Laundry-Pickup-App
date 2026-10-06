import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const homeByRole = {
  customer: "/customer",
  admin: "/admin",
  delivery_agent: "/delivery",
};

export default function RoleGuard({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={homeByRole[user?.role] || "/login"} replace />;
  }
  return children;
}
