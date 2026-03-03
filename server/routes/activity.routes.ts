import express from "express";
import { db } from "../db";
import { activity } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

const router = express.Router();

router.get("/recent", async (req: any, res) => {
  try {
    // ✅ Get user from session
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const activities = await db
      .select()
      .from(activity)
      .where(eq(activity.userId, userId))
      .orderBy(desc(activity.createdAt))
      .limit(5);

    res.json(activities);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

export default router;