import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PricingCatalog from "@/components/PricingCatalog";
import { Shirt, Truck, Clock, ShieldCheck, Sparkles } from "lucide-react";

const homeByRole = {
  customer: "/customer",
  admin: "/admin",
  delivery_agent: "/delivery",
};
const ORDER_DEST = "/customer/order/new";

export default function BrowseServices() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const orderDestination = prompt?._id
    ? `${ORDER_DEST}?serviceId=${encodeURIComponent(prompt._id)}`
    : ORDER_DEST;

  function selectService(svc) {
    if (isAuthenticated && user?.role === "customer") {
      navigate(`${ORDER_DEST}?serviceId=${encodeURIComponent(svc._id)}`);
    } else {
      setPrompt(svc);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 lg:min-h-16 lg:flex-nowrap">
          <Link
            to="/services#home"
            className="flex shrink-0 items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <span className="font-display font-semibold text-lg">
              LaundryPickup
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center justify-center gap-5 overflow-x-auto whitespace-nowrap text-sm font-medium lg:order-none lg:w-auto lg:gap-4"
          >
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              to="/services#home"
            >
              Home
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              to="/services#services"
            >
              Our Services
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              to="/services#about"
            >
              About Us
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              to="/services#contact"
            >
              Contact Us
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild variant="outline" size="sm">
                <Link to={homeByRole[user?.role] || "/services"}>
                  My account
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section
        id="home"
        className="relative scroll-mt-20 overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background"
      >
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" /> On-demand laundry pickup
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">
              Fresh laundry, picked up from your door.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Browse our services and schedule a pickup in minutes. We collect,
              clean, and deliver — back to you.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Free pickup &amp;
                delivery
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Flexible time slots
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Quality
                guaranteed
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-20 max-w-6xl mx-auto px-4 py-10"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold">Our services</h2>
            <p className="text-sm text-muted-foreground">
              Browse our services and tap to start an order.
            </p>
          </div>
        </div>

        <PricingCatalog onSelect={selectService} />
      </section>

      <section id="about" className="scroll-mt-20 border-y bg-muted/30">
        <div className="max-w-6xl mx-auto grid gap-4 px-4 py-10 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] sm:items-center sm:gap-12 sm:py-14">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">
              About LaundryPickup
            </p>
            <h2 className="text-2xl font-display font-semibold">
              Laundry care, arranged around your day.
            </h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Choose a cleaning service, schedule a pickup, and follow your order
            through collection, cleaning, and delivery from your account.
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-display font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              Need help with a pickup? Sign in to review your orders, or create
              an account to schedule your first collection.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button asChild variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-primary" /> LaundryPickup
          </span>
          <span>Pickup · Clean · Deliver</span>
        </div>
      </footer>

      <Dialog open={!!prompt} onOpenChange={(o) => !o && setPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to place your order</DialogTitle>
            <DialogDescription>
              {prompt?.name
                ? `Create an account or sign in to order “${prompt.name}” and schedule your pickup.`
                : "Create an account or sign in to schedule your pickup."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/login" state={{ from: orderDestination }}>
                Log in
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/register" state={{ from: orderDestination }}>
                Create account
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
