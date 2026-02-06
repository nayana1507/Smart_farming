import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMarketPrices(crop?: string, location?: string) {
  return useQuery({
    queryKey: [api.market.prices.path, crop, location],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data generator based on filters
      const basePrice = crop === 'Wheat' ? 240 : crop === 'Corn' ? 180 : 200;
      
      return [
        { market: "Central Market", price: basePrice + Math.random() * 20, trend: "up" },
        { market: "North District", price: basePrice - Math.random() * 15, trend: "down" },
        { market: "Export Hub", price: basePrice + Math.random() * 40, trend: "stable" },
        { market: "Local Co-op", price: basePrice, trend: "up" },
      ];
    },
  });
}
