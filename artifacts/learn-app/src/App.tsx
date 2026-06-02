import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Onboarding from "./pages/onboarding";
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
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      
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
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
