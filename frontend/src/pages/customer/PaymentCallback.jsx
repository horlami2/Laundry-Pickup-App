import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paymentService } from "@/services/paymentService";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState("verifying");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }
    (async () => {
      try {
        const res = await paymentService.verify(reference);
        setOrder(res.order);
        setStatus("success");
      } catch {
        setStatus("failed");
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        {status === "verifying" && (
          <PageLoader label="Verifying your payment…" />
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-display font-semibold">
              Payment Successful
            </h1>
            <p className="text-muted-foreground">
              Your payment has been confirmed.
            </p>
            <Button asChild>
              <Link
                to={
                  order ? `/customer/orders/${order._id}` : "/customer/orders"
                }
              >
                View Order
              </Link>
            </Button>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <h1 className="text-2xl font-display font-semibold">
              Payment Verification Failed
            </h1>
            <p className="text-muted-foreground">
              We couldn&apos;t verify your payment. If you were charged, please
              contact support.
            </p>
            <Button asChild>
              <Link to="/customer/orders">Back to Orders</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
