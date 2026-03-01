import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SoilAnalysis from "@/pages/SoilAnalysis";
import DiseaseDetection from "@/pages/DiseaseDetection";
import MarketPrices from "@/pages/MarketPrices";

/* ================= ROUTES ================= */

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/soil-analysis" component={SoilAnalysis} />
      <Route path="/disease-detection" component={DiseaseDetection} />
      <Route path="/market-prices" component={MarketPrices} />
      <Route component={NotFound} />
    </Switch>
  );
}

/* ================= APP ROOT ================= */

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;