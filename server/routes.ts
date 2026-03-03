import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { fetchMarketPrices } from "./agmarknet";
import weatherRoutes from "./routes/weather";
import soilCropRoutes from "./routes/soilCrop.routes";
import { pool } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===============================
  // WEATHER
  // ===============================
  app.use("/api/weather", weatherRoutes);

  // ===============================
  // SOIL
  // ===============================
  app.use("/api/soil", soilCropRoutes);

  // ===============================
  // AUTH LOGIN
  // ===============================
  app.post(api.auth.login.path, async (req: any, res) => {
    try {
      const { email, password } =
        api.auth.login.input.parse(req.body);

      const user = await storage.getUserByUsername(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // 🔥 Store session
      req.session.userId = user.id;

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

  // ===============================
  // AUTH REGISTER
  // ===============================
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
  // GET CURRENT USER (SESSION RESTORE)
  // ===============================
  app.get("/api/me", async (req: any, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not logged in" });
      }

      const user = await storage.getUserById(req.session.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name ?? "",
      });

    } catch {
      return res.status(500).json({
        message: "Failed to fetch user",
      });
    }
  });

  // ===============================
  // LOGOUT
  // ===============================
  app.post("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // ===============================
  // DISEASE DETECTION (MOCK)
  // ===============================
  app.post(api.disease.detect.path, async (req: any, res) => {
    try {
      const result = {
        disease: "Late Blight",
        severity: "High",
        treatment:
          "Apply copper-based fungicides. Remove infected leaves immediately.",
      };

      if (req.session?.userId) {
        await pool.query(
          `
          INSERT INTO activity (user_id, type, title, description)
          VALUES ($1, $2, $3, $4)
          `,
          [
            req.session.userId,
            "DISEASE_DETECTION",
            "Disease Detection Performed",
            `Detected disease: ${result.disease}`
          ]
        );
      }

      return res.json(result);

    } catch {
      return res.status(500).json({
        message: "Detection failed",
      });
    }
  });

  // ===============================
  // MARKET PRICES
  // ===============================
  app.get("/api/market/prices", async (req: any, res) => {
    try {
      const data = await fetchMarketPrices();

      if (req.session?.userId) {
        await pool.query(
          `
          INSERT INTO activity (user_id, type, title, description)
          VALUES ($1, $2, $3, $4)
          `,
          [
            req.session.userId,
            "MARKET_PRICE",
            "Market Price Checked",
            "User checked market prices"
          ]
        );
      }

      return res.json(data);

    } catch {
      return res.status(500).json({
        message: "Failed to fetch market prices",
      });
    }
  });

  return httpServer;
}