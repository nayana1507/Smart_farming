
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { fetchMarketPrices } from "./agmarknet";
import weatherRoutes from "./routes/weather";
import soilCropRoutes from "./routes/soilCrop.routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===============================
  // WEATHER ROUTE
  // ===============================
  app.use("/api/weather", weatherRoutes);

  // ===============================
  // SOIL + CROP ML ANALYSIS
  // ===============================
  app.use("/api/soil", soilCropRoutes);

  // ===============================
  // AUTH ROUTES
  // ===============================

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } =
        api.auth.login.input.parse(req.body);

      const user = await storage.getUserByUsername(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name ?? "User",
      });
    } catch {
      return res.status(400).json({
        message: "Invalid input",
      });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input =
        api.auth.register.input.parse(req.body);

      const existing =
        await storage.getUserByUsername(input.email);

      if (existing) {
        return res.status(400).json({
          message: "User already exists",
        });
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
    } catch {
      return res.status(400).json({
        message: "Registration failed",
      });
    }
  });


  // ===============================

  // DISEASE DETECTION (Mock)
  // ===============================
  app.post(api.disease.detect.path, (_req, res) => {
    return res.json({
      disease: "Late Blight",
      severity: "High",
      treatment:
        "Apply copper-based fungicides. Remove infected leaves immediately.",
    });
  });

  // ===============================
  // MARKET PRICES
  // ===============================
  app.get("/api/market/prices", async (_req, res) => {
    try {
      const data = await fetchMarketPrices();

  // ==============
      return res.json(data);
    } catch {
      return res.status(500).json({
        message: "Failed to fetch market prices",
      });
    }
  });

  // ===============================
  // DEFAULT USERS (OPTIONAL SEED)
  // ===============================
  const existingSeedUser =
    await storage.getUserByUsername("farmer@example.com");

  if (!existingSeedUser) {
    await storage.createUser({
      email: "farmer@example.com",
      password: "password123",
      name: "John Doe",
    });
  }

  const existingGuest =
    await storage.getUserByUsername("guest@demo.com");

  if (!existingGuest) {
    await storage.createUser({
      email: "guest@demo.com",
      password: "password",
      name: "Guest User",
    });
  }

  return httpServer;
}