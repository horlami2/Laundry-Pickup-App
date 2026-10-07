import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  Home,
  Store,
  ShoppingBag,
  Plus,
  Bell,
  LogOut,
  Menu,
  Truck,
  ClipboardList,
  Sparkles,
  Shirt,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navByRole = {
  customer: [
    { to: "/customer", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/customer/order/new", label: "New Order", icon: Plus },
    { to: "/customer/orders", label: "My Orders", icon: ShoppingBag },
    { to: "/customer/notifications", label: "Notifications", icon: Bell },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/services", label: "Services", icon: Sparkles },
    { to: "/admin/github-sync", label: "Repo Sync", icon: Github },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
  ],
  delivery_agent: [
    { to: "/delivery", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/delivery/orders", label: "My Assignments", icon: Truck },
    { to: "/delivery/notifications", label: "Notifications", icon: Bell },
  ],
};

const roleLabel = {
  customer: "Customer",
  admin: "Administrator",
  delivery_agent: "Delivery Agent",
};

function NavItems({ items, onNavigate }) {
  return items.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
        )
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  ));
}

function PublicNavItems({ onNavigate }) {
  const links = [
    { to: "/services#home", label: "Home", icon: Home },
    { to: "/services#services", label: "Our Services", icon: Store },
  ];

  return links.map(({ to, label, icon: Icon }) => (
    <Link
      key={to}
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  ));
}

function SidebarContent({ items, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Shirt className="w-5 h-5" />
        </div>
        <span className="font-display font-semibold text-lg">
          LaundryPickup
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
            Storefront
          </p>
          <PublicNavItems onNavigate={onNavigate} />
        </div>
        <div className="my-3 border-t border-sidebar-border" />
        <div className="space-y-1">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
            Account
          </p>
          <NavItems items={items} onNavigate={onNavigate} />
        </div>
      </nav>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = navByRole[user?.role] || [];
  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarContent items={items} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur px-4 lg:px-8">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <div className="font-display font-semibold hidden lg:block">
              {roleLabel[user?.role]} Portal
            </div>
            <div className="lg:hidden flex items-center gap-2 font-display font-semibold">
              <Shirt className="w-5 h-5 text-primary" /> LaundryPickup
            </div>
            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:bg-accent pr-3 pl-1 py-1 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {roleLabel[user?.role]}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-rose-600 focus:text-rose-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SidebarContent items={items} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
