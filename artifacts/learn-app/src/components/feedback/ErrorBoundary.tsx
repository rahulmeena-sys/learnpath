import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * App-level error boundary. Catches render-time exceptions anywhere in the tree
 * so a single broken screen doesn't blank the whole app. Data-fetching errors
 * are handled per-screen with <ErrorState>; this is the last-resort net.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("Uncaught render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <h1 className="text-xl font-bold text-foreground">
            Something broke
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
