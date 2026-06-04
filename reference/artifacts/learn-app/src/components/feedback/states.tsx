import { AlertTriangle, Inbox, RotateCw } from "lucide-react";

/** Centered loading spinner for full-screen / section loading. */
export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

/** Error state with an optional retry action. */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

/** Empty state for when a query succeeds but has no data. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
