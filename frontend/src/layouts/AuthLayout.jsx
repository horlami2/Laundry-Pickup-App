import { Shirt } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 font-display font-semibold text-xl">
          <Shirt className="w-6 h-6" /> LaundryPickup
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold leading-tight">
            Fresh laundry, picked up and delivered to your door.
          </h1>
          <p className="opacity-80 mt-3 max-w-md">
            Schedule a pickup in minutes, track your order live, and pay
            securely with Paystack.
          </p>
        </div>
        <p className="opacity-70 text-sm">© 2026 LaundryPickup</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
