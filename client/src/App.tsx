import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "./env";
import MindMap from "@/pages/MindMap";
import LoginPage from "@/pages/LoginPage";
import EnvTest from "@/components/EnvTest";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

// Helper to safely access environment variables
const getEnv = (key: string): string | undefined => {
  try {
    return (import.meta as any).env?.[key];
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error);
    return undefined;
  }
};

function Router() {
  const [isDev, setIsDev] = useState(false);
  
  // Check if Auth0 is configured
  const isAuthConfigured = env.AUTH0_DOMAIN && env.AUTH0_CLIENT_ID;

  // Check if we're in development mode
  useEffect(() => {
    setIsDev(getEnv('MODE') === 'development');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Show environment test banner in development */}
      {isDev && <EnvTest />}
      
      <Switch>
        {isAuthConfigured ? (
          <Route path="/" component={MindMap} />
        ) : (
          <Route path="/" component={LoginPage} />
        )}
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
