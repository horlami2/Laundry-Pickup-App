import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { orderService } from "@/services/orderService";
import { serviceService } from "@/services/serviceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import PageLoader from "@/components/PageLoader";
import SubmitButton from "@/components/SubmitButton";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { formatMoney } from "@/utils/format";

const EMPTY_SERVICES = [];

const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
];

export default function NewOrder() {
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => serviceService.getActive(), []);
  const { request, loading: submitting } = useRequest();
  const services = data?.services || EMPTY_SERVICES;

  const [cart, setCart] = useState({});
  const [form, setForm] = useState({
    pickupAddressLine: "",
    pickupCity: "",
    pickupState: "",
    pickupLandmark: "",
    pickupInstructions: "",
    sameAddress: true,
    deliveryAddressLine: "",
    deliveryCity: "",
    deliveryState: "",
    contactPhone: "",
    pickupDate: "",
    pickupTimeSlot: "",
    customerNote: "",
  });

  const subtotal = useMemo(
    () =>
      services.reduce((sum, svc) => sum + svc.price * (cart[svc._id] || 0), 0),
    [services, cart],
  );

  function setQty(id, delta) {
    setCart((c) => {
      const q = Math.max(0, (c[id] || 0) + delta);
      const next = { ...c };
      if (q > 0) next[id] = q;
      else delete next[id];
      return next;
    });
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const items = Object.entries(cart).map(([service, quantity]) => ({
      service,
      quantity,
    }));
    if (items.length === 0) {
      toast.error("Add at least one service");
      return;
    }
    if (
      !form.contactPhone ||
      !form.pickupDate ||
      !form.pickupTimeSlot ||
      !form.pickupAddressLine ||
      !form.pickupCity
    ) {
      toast.error("Please complete the pickup details");
      return;
    }
    const pickupAddress = {
      addressLine: form.pickupAddressLine,
      city: form.pickupCity,
      state: form.pickupState,
      landmark: form.pickupLandmark,
      instructions: form.pickupInstructions,
    };
    const deliveryAddress = form.sameAddress
      ? pickupAddress
      : {
          addressLine: form.deliveryAddressLine,
          city: form.deliveryCity,
          state: form.deliveryState,
        };

    const payload = {
      items,
      pickupAddress,
      deliveryAddress,
      contactPhone: form.contactPhone,
      pickupDate: form.pickupDate,
      pickupTimeSlot: form.pickupTimeSlot,
      customerNote: form.customerNote,
    };

    try {
      const res = await request(() => orderService.createOrder(payload));
      toast.success("Order placed successfully");
      navigate(`/customer/orders/${res.order._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <PageLoader label="Loading services…" />;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">
          New Laundry Order
        </h1>
        <p className="text-muted-foreground text-sm">
          Select services and schedule a pickup.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Choose Services</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  No services available right now.
                </p>
              )}
              {services.map((svc) => (
                <div key={svc._id} className="flex gap-3 rounded-lg border p-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {svc.image?.url && (
                      <Image
                        src={svc.image.url}
                        alt={svc.name}
                        className="w-full h-full"
                        fittingType="fill"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {svc.category}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {formatMoney(svc.price)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{svc.unit}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 self-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty(svc._id, -1)}
                      disabled={!cart[svc._id]}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {cart[svc._id] || 0}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty(svc._id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Pickup &amp; Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pickup address</Label>
                  <Input
                    value={form.pickupAddressLine}
                    onChange={(e) =>
                      update("pickupAddressLine", e.target.value)
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={form.pickupCity}
                    onChange={(e) => update("pickupCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input
                    value={form.pickupState}
                    onChange={(e) => update("pickupState", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Landmark</Label>
                  <Input
                    value={form.pickupLandmark}
                    onChange={(e) => update("pickupLandmark", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Instructions</Label>
                <Textarea
                  value={form.pickupInstructions}
                  onChange={(e) => update("pickupInstructions", e.target.value)}
                  placeholder="Any pickup notes"
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.sameAddress}
                  onChange={(e) => update("sameAddress", e.target.checked)}
                  className="rounded border-input"
                />
                Deliver to the same address
              </label>
              {!form.sameAddress && (
                <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1.5">
                    <Label>Delivery address</Label>
                    <Input
                      value={form.deliveryAddressLine}
                      onChange={(e) =>
                        update("deliveryAddressLine", e.target.value)
                      }
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input
                      value={form.deliveryCity}
                      onChange={(e) => update("deliveryCity", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input
                      value={form.deliveryState}
                      onChange={(e) => update("deliveryState", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Schedule &amp; Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Contact phone</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                  placeholder="+234…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pickup date</Label>
                <Input
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) => update("pickupDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Pickup time slot</Label>
                <Select
                  value={form.pickupTimeSlot}
                  onValueChange={(v) => update("pickupTimeSlot", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Order note</Label>
                <Textarea
                  value={form.customerNote}
                  onChange={(e) => update("customerNote", e.target.value)}
                  placeholder="Special requests"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(cart).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No services selected yet.
                </p>
              ) : (
                services
                  .filter((s) => cart[s._id])
                  .map((s) => (
                    <div key={s._id} className="flex justify-between text-sm">
                      <span>
                        {s.name} × {cart[s._id]}
                      </span>
                      <span>{formatMoney(s.price * cart[s._id])}</span>
                    </div>
                  ))
              )}
              <div className="border-t pt-3 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
              <SubmitButton
                type="submit"
                loading={submitting}
                className="w-full"
                disabled={Object.keys(cart).length === 0}
              >
                Place Order
              </SubmitButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
