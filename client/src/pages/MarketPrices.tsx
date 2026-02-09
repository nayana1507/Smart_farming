import { cn } from "@/lib/utils";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useMarketPrices } from "@/hooks/use-market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from "@/components/ui/button";

export default function MarketPrices() {
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");
  const [selectedLocation, setSelectedLocation] = useState<string>("Regional");
  
  const { data: prices, isLoading, refetch } = useMarketPrices(selectedCrop, selectedLocation);

  // Mock historical data for the chart (in INR per quintal)
  const historicalData = [
    { day: 'Mon', price: 17500 },
    { day: 'Tue', price: 17900 },
    { day: 'Wed', price: 17650 },
    { day: 'Thu', price: 18100 },
    { day: 'Fri', price: 18750 },
    { day: 'Sat', price: 18500 },
    { day: 'Sun', price: 19100 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Market Prices</h1>
            <p className="text-muted-foreground mt-1">Real-time agricultural commodity prices across markets.</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wheat">Wheat</SelectItem>
                <SelectItem value="Corn">Corn</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Soybeans">Soybeans</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh Prices">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedCrop} Price Trend</span>
                <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">Last 7 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} domain={['dataMin - 500', 'dataMax + 500']} />
                  <CartesianGrid vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Card */}
          <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 flex flex-col justify-center">
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-emerald-100 text-lg font-medium">Average Price</p>
              <h2 className="text-5xl font-display font-bold">₹18,750</h2>
              <p className="text-emerald-100 text-sm">Per Quintal</p>
              <div className="pt-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 mr-2" /> +4.2% This Week
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Table */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Regional Markets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-gray-50/50">
                    <TableHead className="w-[300px]">Market Location</TableHead>
                    <TableHead className="text-right">Price / Quintal</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices?.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.market}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {item.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                          <span className={cn(
                            "text-xs capitalize",
                            item.trend === 'up' ? "text-green-600" : item.trend === 'down' ? "text-red-600" : "text-gray-500"
                          )}>
                            {item.trend}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-sm text-gray-600">Active</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}