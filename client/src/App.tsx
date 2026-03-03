import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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

/* ================= PROTECTED ROUTER ================= */

function Router() {
  const { user } = useAuth();

  return (
    <Switch>

      {/* LOGIN PAGE */}
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Login />}
      </Route>

      {/* REGISTER PAGE */}
      <Route path="/register">
        {user ? <Redirect to="/dashboard" /> : <Register />}
      </Route>

      {/* DASHBOARD (Protected) */}
      <Route path="/dashboard">
        {user ? <Dashboard /> : <Redirect to="/" />}
      </Route>

      {/* SOIL ANALYSIS (Protected) */}
      <Route path="/soil-analysis">
        {user ? <SoilAnalysis /> : <Redirect to="/" />}
      </Route>

      {/* DISEASE DETECTION (Protected) */}
      <Route path="/disease-detection">
        {user ? <DiseaseDetection /> : <Redirect to="/" />}
      </Route>

      {/* MARKET PRICES (Protected) */}
      <Route path="/market-prices">
        {user ? <MarketPrices /> : <Redirect to="/" />}
      </Route>

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