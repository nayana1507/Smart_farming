import {pgTable,text,serial,integer,jsonb,varchar,timestamp} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const soilAnalysis = pgTable("soil_analysis", {
  id: serial("id").primaryKey(),

  nValue: integer("n_value").notNull(),
  pValue: integer("p_value").notNull(),
  kValue: integer("k_value").notNull(),
  phValue: integer("ph_value"),
  location: text("location").notNull(),
  timeOfYear: text("time_of_year"),
});

export const insertSoilAnalysisSchema = createInsertSchema(soilAnalysis).omit({ id: true });

export const diseaseDetections = pgTable("disease_detections", {
  id: serial("id").primaryKey(),
  cropName: text("crop_name").notNull(),
});

export const insertDiseaseDetectionSchema = createInsertSchema(diseaseDetections).omit({ id: true });

export const marketPrices = pgTable("market_prices", {
  id: serial("id").primaryKey(),
  cropName: text("crop_name").notNull(),
  location: text("location").notNull(),
});

export const insertMarketPriceSchema = createInsertSchema(marketPrices).omit({ id: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSoilAnalysis = z.infer<typeof insertSoilAnalysisSchema>;

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});