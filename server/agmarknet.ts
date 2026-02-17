import axios from "axios";

const API_KEY = "579b464db66ec23bdd000001fb6edc143e50466151cd2288e9b87c3f";

export async function fetchMarketPrices() {
  try {
    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 100,
          "filters[state]": "Kerala"   // remove this line if you want all India
        }
      }
    );

    return response.data.records; // VERY IMPORTANT
  } catch (error) {
    console.error("Market API error:", error);
    throw error;
  }
}
