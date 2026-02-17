import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const lat = req.query.lat || "9.9312";  // Default Kochi
    const lon = req.query.lon || "76.2673";

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation&timezone=auto`
    );

    const data = await response.json();

    const rainfall =
      data.hourly?.precipitation?.[0] ?? 0;

    res.json({
      city: data.timezone ?? "Unknown",
      temperature: data.current_weather?.temperature,
      windspeed: data.current_weather?.windspeed,
      condition: "Live Weather",
      rainfall: rainfall,
    });

  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ message: "Failed to fetch weather" });
  }
});

export default router;
