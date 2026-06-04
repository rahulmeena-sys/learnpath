import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetProfile } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Onboarding from "./pages/onboarding";
import Login from "./pages/login";
import Admin from "./pages/admin";
import Home from "./pages/home";
import Today from "./pages/today";
import Library from "./pages/library";
import ContentDetail from "./pages/content-detail";
import LearnSession from "./pages/learn-session";
import LearnSummary from "./pages/learn-summary";
import Roadmaps from "./pages/roadmaps";
import RoadmapDetail from "./pages/roadmap-detail";
import SavedCards from "./pages/saved-cards";
import Profile from "./pages/profile";
import Sandbox from "./pages/sandbox";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import { LoadingState } from "./components/feedback/states";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/** Decides whether a signed-in user lands on onboarding or the app. */
function Root() {
  const { data: profile, isLoading } = useGetProfile();
  if (isLoading) return <LoadingState />;
  if (profile?.onboardingComplete) return <Redirect to="/home" />;
  return <Onboarding />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Root} />
      
      {/* Main app flows with bottom navigation */}
      <Route path="/home">
        <AppLayout><Home /></AppLayout>
      </Route>
      <Route path="/today">
        <AppLayout><Today /></AppLayout>
      </Route>
      <Route path="/library">
        <AppLayout><Library /></AppLayout>
      </Route>
      <Route path="/roadmaps">
        <AppLayout><Roadmaps /></AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout><Profile /></AppLayout>
      </Route>
      
      {/* Flows without bottom navigation */}
      <Route path="/content/:contentId" component={ContentDetail} />
      <Route path="/learn/:sessionId" component={LearnSession} />
      <Route path="/learn/:sessionId/summary" component={LearnSummary} />
      <Route path="/roadmaps/:roadmapId" component={RoadmapDetail} />
      <Route path="/saved" component={SavedCards} />

      {/* Admin content pipeline (server enforces admin) */}
      <Route path="/admin" component={Admin} />

      {/* UI design sandbox — test ChatGPT-generated variants */}
      <Route path="/sandbox" component={Sandbox} />
      <Route path="/sandbox/:variant" component={Sandbox} />

      <Route component={NotFound} />
    </Switch>
  );
}

/** Gates the app on a Supabase session. Sandbox stays public (mock-data UI tool). */
function AuthGate() {
  const { session, loading } = useAuth();
  const isSandbox =
    typeof window !== "undefined" && window.location.pathname.includes("/sandbox");

  if (loading) return <LoadingState />;
  if (!session && !isSandbox) return <Login />;
  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AuthGate />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
