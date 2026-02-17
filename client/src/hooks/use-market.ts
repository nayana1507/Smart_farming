import { useQuery } from "@tanstack/react-query";

export interface MarketItem {
  state: string;
  district: string;
  market: string;
  commodity: string;
  modal_price: number;
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ["market-prices"],
    queryFn: async () => {
      console.log("Fetching market prices..."); // 👈 ADD THIS

      const res = await fetch("/api/market/prices");

      if (!res.ok) {
        throw new Error("Failed to fetch market prices");
      }

      return res.json();
    },
  });
}

