import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { fetchMarketPrices } from "./agmarknet";
import weatherRoutes from "./routes/weather";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===============================
  // WEATHER ROUTE
  // ===============================
  app.use("/api/weather", weatherRoutes);


  // ===============================
  // AUTH ROUTES
  // ===============================

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name ?? "User",
      });

    } catch (error) {
      return res.status(400).json({ message: "Invalid input" });
    }
  });


  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        email: input.email,
        password: input.password,
        name: input.name,
      });

      return res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name ?? "",
      });

    } catch (error) {
      return res.status(400).json({ message: "Registration failed" });
    }
  });


  // ===============================
  // SOIL ANALYSIS (Mock)
  // ===============================

  app.post(api.soil.analyze.path, (req, res) => {
    return res.json({
      soilType: "Loamy Soil",
      fertility: "High",
      condition: "Optimal for most crops. Slightly acidic.",
      crops: [
        { name: "Wheat", score: 95 },
        { name: "Corn", score: 88 },
        { name: "Soybeans", score: 82 },
      ],
      irrigation: {
        type: "Drip Irrigation",
        requirement: "Medium",
        frequency: "Every 2-3 days",
      },
    });
  });


  // ===============================
  // DISEASE DETECTION (Mock)
  // ===============================

  app.post(api.disease.detect.path, (req, res) => {
    return res.json({
      disease: "Late Blight",
      severity: "High",
      treatment:
        "Apply copper-based fungicides. Remove infected leaves immediately.",
    });
  });


  // ===============================
  // MARKET PRICES (Live)
  // ===============================

  app.get("/api/market/prices", async (_req, res) => {
    try {
      const data = await fetchMarketPrices();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market prices" });
    }
  });


  // ===============================
  // SEED DEFAULT USER
  // ===============================

  const existingSeedUser = await storage.getUserByUsername("farmer@example.com");

  if (!existingSeedUser) {
    await storage.createUser({
      email: "farmer@example.com",
      password: "password123",
      name: "John Doe",
    });

    console.log("Seeded default user: farmer@example.com / password123");
  }

  return httpServer;
}
