import Spinner from "./Spinner";

export default function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <Spinner size={28} className="text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
