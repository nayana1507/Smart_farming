import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Sprout, 
  LayoutDashboard, 
  Activity, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  Droplets,
  ScanEye
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/soil-analysis", label: "Soil Analysis", icon: Droplets },
    { href: "/disease-detection", label: "Disease Detection", icon: ScanEye },
    { href: "/market-prices", label: "Market Prices", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Sprout className="w-6 h-6" />
          <span>SmartFarm</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-muted-foreground">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">SmartFarm</h1>
            <p className="text-xs text-muted-foreground">Precision Agriculture</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/25" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-foreground">{user?.name || "Guest User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
