import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SoilAnalysis from "@/pages/SoilAnalysis";
import DiseaseDetection from "@/pages/DiseaseDetection";
import MarketPrices from "@/pages/MarketPrices";

// Protected Route wrapper could be implemented here
// For simplicity in this demo, we trust the flow
function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/soil-analysis" component={SoilAnalysis} />
      <Route path="/disease-detection" component={DiseaseDetection} />
      <Route path="/market-prices" component={MarketPrices} />
      <Route component={NotFound} />
    </Switch>
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
