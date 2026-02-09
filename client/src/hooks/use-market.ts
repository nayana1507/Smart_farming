import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMarketPrices(crop?: string, location?: string) {
  return useQuery({
    queryKey: [api.market.prices.path, crop, location],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data generator based on filters with INR prices per quintal
      const basePrice = crop === 'Wheat' ? 19000 : 
                       crop === 'Corn' ? 14500 : 
                       crop === 'Rice' ? 21000 : 
                       crop === 'Soybeans' ? 38000 : 
                       17000;
      
      return [
        { market: "Azadpur Mandi, Delhi", price: basePrice + Math.random() * 1500, trend: "up" },
        { market: "APMC Vashi, Mumbai", price: basePrice - Math.random() * 1200, trend: "down" },
        { market: "Koyambedu Market, Chennai", price: basePrice + Math.random() * 2000, trend: "stable" },
        { market: "Bangalore APMC", price: basePrice + Math.random() * 800, trend: "up" },
        { market: "Ludhiana Grain Mandi", price: basePrice - Math.random() * 500, trend: "stable" },
        { market: "Pune APMC", price: basePrice + Math.random() * 1000, trend: "up" },
        { market: "Kolkata Posta Bazar", price: basePrice - Math.random() * 900, trend: "down" },
        { market: "Hyderabad Grain Market", price: basePrice + Math.random() * 600, trend: "stable" },
      ];
    },
  });
}