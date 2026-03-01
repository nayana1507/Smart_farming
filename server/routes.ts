import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  /* ================= AUTH ROUTES ================= */

  // LOGIN
  app.post(api.auth.login.path, async (req, res) => {
    try {
      // Now using email instead of username
      const { email, password } = api.auth.login.input.parse(req.body);

      // storage internally uses email as username
      const user = await storage.getUserByUsername(email);

      // Simple plaintext password check (as your demo currently does)
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name || "User",
      });

    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // REGISTER
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(input);

      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name || "",
      });

    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  /* ================= SOIL ANALYSIS (MOCK) ================= */

  app.post(api.soil.analyze.path, (req, res) => {
    res.json({
      soilType: "Loamy Soil",
      fertility: "High",
      condition: "Optimal for most crops. Slightly acidic.",
      crops: [
        { name: "Wheat", score: 95 },
        { name: "Corn", score: 88 },
        { name: "Soybeans", score: 82 }
      ],
      irrigation: {
        type: "Drip Irrigation",
        requirement: "Medium",
        frequency: "Every 2-3 days"
      }
    });
  });

  /* ================= DISEASE DETECTION (MOCK) ================= */

  app.post(api.disease.detect.path, (req, res) => {
    res.json({
      disease: "Late Blight",
      severity: "High",
      treatment:
        "Apply copper-based fungicides. Remove infected leaves immediately to prevent spread."
    });
  });

  /* ================= MARKET PRICES (MOCK) ================= */

  app.get(api.market.prices.path, (req, res) => {
    res.json([
      { market: "Central Market", price: 1200, trend: "up" },
      { market: "North District Mandi", price: 1150, trend: "stable" },
      { market: "Export Hub", price: 1300, trend: "down" }
    ]);
  });

  /* ================= SEED USER ================= */

  if (await storage.getUserByUsername("farmer@example.com") === undefined) {
    await storage.createUser({
      email: "farmer@example.com",
      password: "password123",
      name: "John Doe"
    });
    console.log("Seeded default user: farmer@example.com / password123");
  } 
  // Seed guest user
  if (await storage.getUserByUsername("guest@demo.com") === undefined) {
    await storage.createUser({
      email: "guest@demo.com",
      password: "password",
      name: "Guest User"
    });
  console.log("Seeded guest user: guest@demo.com / password");
  }

  return httpServer;
}