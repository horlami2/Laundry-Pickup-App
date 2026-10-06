import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import NetworkActivity from "@/components/NetworkActivity";
import PageNotFound from "@/lib/PageNotFound";

import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleGuard from "@/routes/RoleGuard";
import HomeRedirect from "@/routes/HomeRedirect";
import DashboardLayout from "@/layouts/DashboardLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import CustomerDashboard from "@/pages/customer/Dashboard";
import NewOrder from "@/pages/customer/NewOrder";
import MyOrders from "@/pages/customer/MyOrders";
import CustomerOrderDetail from "@/pages/customer/OrderDetail";
import CustomerNotifications from "@/pages/customer/Notification";
import PaymentCallback from "@/pages/customer/PaymentCallback";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";
import AdminServices from "@/pages/admin/Services";
import BrowseServices from "@/pages/browseService";
import AdminNotifications from "@/pages/admin/Notifications";

import DeliveryDashboard from "@/pages/deliveryAgent/Dashboard";
import DeliveryOrders from "@/pages/deliveryAgent/AssignedOrder";
import DeliveryOrderDetail from "@/pages/deliveryAgent/OrderDetail";
import DeliveryNotifications from "@/pages/deliveryAgent/notification";

const AuthenticatedApp = () => {
  const { loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />

      <Route path="/services" element={<BrowseServices />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Customer */}
          <Route
            path="/customer"
            element={
              <RoleGuard roles={["customer"]}>
                <CustomerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/customer/order/new"
            element={
              <RoleGuard roles={["customer"]}>
                <NewOrder />
              </RoleGuard>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <RoleGuard roles={["customer"]}>
                <MyOrders />
              </RoleGuard>
            }
          />
          <Route
            path="/customer/orders/:id"
            element={
              <RoleGuard roles={["customer"]}>
                <CustomerOrderDetail />
              </RoleGuard>
            }
          />
          <Route
            path="/customer/notifications"
            element={
              <RoleGuard roles={["customer"]}>
                <CustomerNotifications />
              </RoleGuard>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RoleGuard roles={["admin"]}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RoleGuard roles={["admin"]}>
                <AdminOrders />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <RoleGuard roles={["admin"]}>
                <AdminOrderDetail />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/services"
            element={
              <RoleGuard roles={["admin"]}>
                <AdminServices />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <RoleGuard roles={["admin"]}>
                <AdminNotifications />
              </RoleGuard>
            }
          />

          {/* Delivery Agent */}
          <Route
            path="/delivery"
            element={
              <RoleGuard roles={["delivery_agent"]}>
                <DeliveryDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/delivery/orders"
            element={
              <RoleGuard roles={["delivery_agent"]}>
                <DeliveryOrders />
              </RoleGuard>
            }
          />
          <Route
            path="/delivery/orders/:id"
            element={
              <RoleGuard roles={["delivery_agent"]}>
                <DeliveryOrderDetail />
              </RoleGuard>
            }
          />
          <Route
            path="/delivery/notifications"
            element={
              <RoleGuard roles={["delivery_agent"]}>
                <DeliveryNotifications />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <NetworkActivity />
          <AuthenticatedApp />
        </Router>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
