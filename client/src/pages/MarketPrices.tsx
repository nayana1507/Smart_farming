import { Layout } from "@/components/Layout";
import { useState, useMemo, useEffect } from "react";
import type { MarketItem } from "@/hooks/use-market";
import { useMarketPrices } from "@/hooks/use-market";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketPrices() {
  const { data: prices = [], isLoading, refetch } = useMarketPrices();

  const [selectedCrop, setSelectedCrop] = useState<string>("");

  // 🔹 Generate unique crop list dynamically
  const uniqueCrops: string[] = useMemo(() => {
    if (!prices.length) return [];

    return Array.from(
      new Set(prices.map((item: MarketItem) => item.commodity))
    );
  }, [prices]);

  // 🔹 Automatically set first crop when data loads
  useEffect(() => {
    if (uniqueCrops.length > 0 && !selectedCrop) {
      setSelectedCrop(uniqueCrops[0]);
    }
  }, [uniqueCrops, selectedCrop]);

  // 🔹 Filter prices by selected crop
  const filteredPrices: MarketItem[] = useMemo(() => {
    if (!prices.length || !selectedCrop) return [];

    return prices.filter((item: MarketItem) =>
      item.commodity
        ?.toLowerCase()
        .includes(selectedCrop.toLowerCase())
    );
  }, [prices, selectedCrop]);

  // 🔹 Calculate average modal price
  const averagePrice: number = useMemo(() => {
    if (!filteredPrices.length) return 0;

    const total = filteredPrices.reduce(
      (sum: number, item: MarketItem) =>
        sum + Number(item.modal_price || 0),
      0
    );

    return total / filteredPrices.length;
  }, [filteredPrices]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Market Prices
            </h1>
            <p className="text-muted-foreground mt-1">
              Live agricultural commodity prices (Agmarknet API)
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[220px] bg-white">
                <SelectValue placeholder="Select Crop" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCrops.map((crop: string, i: number) => (
                  <SelectItem key={i} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Average Card */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Average Price</p>
            <h2 className="text-4xl font-bold">
              ₹{averagePrice.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h2>
            <p className="text-sm text-muted-foreground">
              Per Quintal
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Markets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">
                      Modal Price (₹)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrices.slice(0, 50).map(
                    (item: MarketItem, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{item.state}</TableCell>
                        <TableCell>{item.district}</TableCell>
                        <TableCell>{item.market}</TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{Number(item.modal_price).toLocaleString(
                            "en-IN"
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
