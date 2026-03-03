import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Droplets, ScanEye, TrendingUp, Sun, CloudRain, Wind } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useWeather } from "@/hooks/use-weather";

export default function Dashboard() {
  const { user } = useAuth();

  // ================= GREETING =================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const greeting = getGreeting();

  // ================= WEATHER =================
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    });
  }, []);

  const { data: weather, isLoading } = useWeather(coords?.lat, coords?.lon);

  // ================= SEASONAL TIPS =================
  const [seasonData, setSeasonData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/seasonal-tips")
      .then(res => res.json())
      .then(data => setSeasonData(data))
      .catch(console.error);
  }, []);

  // ================= RECENT ACTIVITY =================
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity/recent", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setActivities(data);
        setActivityLoading(false);
      })
      .catch(err => {
        console.error("Activity fetch failed:", err);
        setActivityLoading(false);
      });
  }, []);


   const [currentTime, setCurrentTime] = useState(Date.now());

   useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 60000); // 60 seconds

  return () => clearInterval(interval);
  }, []);

  // ================= HELPERS =================

  function getActivityColor(type: string) {
    switch (type) {
      case "SOIL_ANALYSIS":
        return "bg-blue-100 text-blue-700";
      case "DISEASE_DETECTION":
        return "bg-red-100 text-red-700";
      case "MARKET_PRICE":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatType(type: string) {
    return type
      .toLowerCase()
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

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

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {greeting}, {user?.name ?? "Farmer"}. Here's what's happening today.
            </p>
          </div>

          {/* WEATHER */}
          <div className="flex items-center gap-3 bg-white p-3 pr-5 rounded-xl shadow-sm border border-border min-w-[240px]">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Sun className="w-5 h-5" />
            </div>

            {isLoading ? (
              <div>
                <p className="text-sm font-semibold">Loading...</p>
                <p className="text-xs text-muted-foreground">Fetching weather</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">
                  {weather?.temperature ?? "--"}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  {weather?.condition ?? "Weather"} • {weather?.city ?? "Your Area"}
                </p>
              </div>
            )}

            <div className="h-8 w-px bg-border mx-3"></div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                {weather?.rainfall ?? 0}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {weather?.windspeed ?? "--"} km/h
              </span>
            </div>
          </div>
        </header>

        {/* FEATURE CARDS */}
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

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* RECENT ACTIVITY */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                {activityLoading ? (
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : (
                  activities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.title}
                        </h4>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityColor(
                          item.type
                        )}`}
                      >
                        {formatType(item.type)}
                      </span>
                    </div>
                  ))
                )}

              </div>
            </CardContent>
          </Card>

          {/* SEASONAL TIPS */}
          <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white">
                Seasonal Tips ({seasonData?.season ?? "Loading..."})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!seasonData ? (
                <p className="text-sm opacity-80">Loading seasonal tips...</p>
              ) : (
                seasonData.tips.map((tip: any, index: number) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h4 className="font-bold mb-1">{tip.title}</h4>
                    <p className="text-emerald-50 text-sm">{tip.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}