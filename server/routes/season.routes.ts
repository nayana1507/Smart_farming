import express from "express";

const router = express.Router();

function getSeason(month: number) {
  if (month >= 3 && month <= 5) return "SUMMER";
  if (month >= 6 && month <= 9) return "MONSOON";
  if (month >= 10 && month <= 11) return "POST_MONSOON";
  return "WINTER";
}

router.get("/", (_req, res) => {
  const month = new Date().getMonth() + 1;
  const season = getSeason(month);

  let tips = [];

  switch (season) {
    case "SUMMER":
      tips = [
        {
          title: "Irrigation Management",
          content: "Increase irrigation frequency. Avoid mid-day watering to reduce evaporation loss."
        },
        {
          title: "Heat Stress Protection",
          content: "Apply mulching to retain soil moisture and reduce root temperature."
        }
      ];
      break;

    case "MONSOON":
      tips = [
        {
          title: "Drainage Control",
          content: "Ensure proper drainage to prevent waterlogging and root rot."
        },
        {
          title: "Pest Monitoring",
          content: "High humidity increases fungal disease risk. Monitor crops weekly."
        }
      ];
      break;

    case "POST_MONSOON":
      tips = [
        {
          title: "Soil Testing",
          content: "Conduct soil testing before winter crop planning."
        },
        {
          title: "Nutrient Replenishment",
          content: "Replenish nitrogen and potassium after heavy rainfall leaching."
        }
      ];
      break;

    case "WINTER":
      tips = [
        {
          title: "Frost Protection",
          content: "Use row covers or irrigation to prevent frost damage."
        },
        {
          title: "Harvest Planning",
          content: "Plan harvest before unexpected cold waves."
        }
      ];
      break;
  }

  res.json({
    season,
    tips,
  });
});

export default router;