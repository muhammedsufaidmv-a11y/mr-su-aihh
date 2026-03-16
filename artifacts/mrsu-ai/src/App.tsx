import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Layout from "@/components/layout";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import StrategyPage from "@/pages/strategy";
import ContentPage from "@/pages/content";
import LeadsPage from "@/pages/leads";
import TasksPage from "@/pages/tasks";
import ChatPage from "@/pages/chat";
import ToolsPage from "@/pages/tools";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/strategy" component={StrategyPage} />
        <Route path="/content" component={ContentPage} />
        <Route path="/leads" component={LeadsPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/tools" component={ToolsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
