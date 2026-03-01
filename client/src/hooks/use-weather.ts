import { useQuery } from "@tanstack/react-query";

export function useWeather(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ["weather", lat, lon],
    queryFn: async () => {
      const url = lat && lon
        ? `/api/weather?lat=${lat}&lon=${lon}`
        : `/api/weather`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch weather");
      }

      return res.json();
    },

    // ✅ AUTO REFRESH EVERY 10 MINUTES
    refetchInterval: 1000 * 60 * 10,
  });
}
