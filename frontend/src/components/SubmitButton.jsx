import { Button } from "@/components/ui/button";
import Spinner from "./Spinner";

export default function SubmitButton({
  loading,
  children,
  disabled,
  ...props
}) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Spinner size={16} />}
      {children}
    </Button>
  );
}
