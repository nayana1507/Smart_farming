import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Droplets, ScanEye, TrendingUp, Sun, CloudRain, Wind } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();

  const features = [
    {
      title: "Soil Analysis",
      description: "Get detailed insights into your soil composition and nutrient levels.",
      icon: Droplets,
      href: "/soil-analysis",
      color: "bg-blue-500",
      gradient: "from-blue-500/20 to-cyan-500/5"
    },
    {
      title: "Disease Detection",
      description: "Identify crop diseases early using our AI-powered image detection.",
      icon: ScanEye,
      href: "/disease-detection",
      color: "bg-rose-500",
      gradient: "from-rose-500/20 to-orange-500/5"
    },
    {
      title: "Market Prices",
      description: "Track real-time market trends to sell your produce at the best price.",
      icon: TrendingUp,
      href: "/market-prices",
      color: "bg-emerald-500",
      gradient: "from-emerald-500/20 to-teal-500/5"
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Good morning, {user?.name || "Farmer"}. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-border">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">24°C</p>
              <p className="text-xs text-muted-foreground">Sunny</p>
            </div>
            <div className="h-8 w-px bg-border mx-2"></div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> 12%</span>
              <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> 8km/h</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Link key={i} href={feature.href}>
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border-border/60 group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} text-white flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base mb-6">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-primary hover:text-primary/80 hover:bg-transparent flex items-center gap-2 group-hover:gap-3 transition-all">
                    Access Tool <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { title: "Soil Sample #204 Analysis", time: "2 hours ago", status: "Completed", color: "text-green-600 bg-green-50" },
                  { title: "Wheat Rust Detection", time: "Yesterday", status: "Action Required", color: "text-red-600 bg-red-50" },
                  { title: "Market Price Alert: Corn", time: "2 days ago", status: "Up 5%", color: "text-blue-600 bg-blue-50" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            {/* Field background */}
            <CardHeader className="relative">
              <CardTitle className="text-white">Seasonal Tips</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <h4 className="font-bold mb-1">Preparing for Harvest</h4>
                <p className="text-emerald-50 text-sm">Monitor moisture levels closely this week. Optimal harvesting window for wheat is approaching in 3-5 days.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <h4 className="font-bold mb-1">Pest Control</h4>
                <p className="text-emerald-50 text-sm">Early signs of aphids detected in the region. Consider preventive neem oil spray.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
