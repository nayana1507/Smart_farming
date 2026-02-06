import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      // Simple password check (plaintext for demo as requested)
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ id: user.id, email: user.email, name: user.name || "User" });
    } catch (error) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      // Check if user exists
      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(input);
      res.status(201).json({ id: user.id, email: user.email, name: user.name || "" });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Soil Analysis - Mock Response
  app.post(api.soil.analyze.path, (req, res) => {
    try {
        api.soil.analyze.input.parse(req.body);
    } catch (e) {
        // ignore validation for demo
    }

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

  // Disease Detection - Mock Response
  app.post(api.disease.detect.path, (req, res) => {
    res.json({
      disease: "Late Blight",
      severity: "High",
      treatment: "Apply copper-based fungicides. Remove infected leaves immediately to prevent spread."
    });
  });

  // Market Prices - Mock Response
  app.get(api.market.prices.path, (req, res) => {
    res.json([
      { market: "Central Market", price: 1200, trend: "up" },
      { market: "North District Mandi", price: 1150, trend: "stable" },
      { market: "Export Hub", price: 1300, trend: "down" }
    ]);
  });

  // Seeding
  if (await storage.getUserByUsername("farmer@example.com") === undefined) {
    await storage.createUser({
      email: "farmer@example.com",
      password: "password123",
      name: "John Doe"
    });
    console.log("Seeded default user: farmer@example.com / password123");
  }

  return httpServer;
}
