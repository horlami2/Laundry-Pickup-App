import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
