import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import { pool } from "../db";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", (_req, res) => {
  res.send("✅ Soil API Working");
});

router.post("/analyze", upload.single("image"), async (req: any, res) => {

  // ✅ CHECK AUTH
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Image missing" });
  }

  const {
    nitrogen = 0,
    phosphorus = 0,
    potassium = 0,
    ph = 7,
    location = "India",
  } = req.body;

  const N = Number(nitrogen);
  const P = Number(phosphorus);
  const K = Number(potassium);
  const PH = Number(ph);

  const python = spawn("python", [
    "script/pipeline/predict_pipeline.py",
    req.file.path,
    N.toString(),
    P.toString(),
    K.toString(),
    PH.toString(),
    location,
  ]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", async () => {
    try {
      const jsonStart = output.indexOf("{");
      const jsonEnd = output.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("JSON not found");
      }

      const jsonString = output.slice(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);

      // ✅ INSERT ACTIVITY USING SESSION USER
      await pool.query(
        `
        INSERT INTO activity (user_id, type, title, description)
        VALUES ($1, $2, $3, $4)
        `,
        [
          userId,
          "SOIL_ANALYSIS",
          "Soil Analysis Completed",
          `Predicted soil type: ${result.soil_type || "Unknown"}`
        ]
      );

      res.json(result);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Prediction failed",
        pythonError: errorOutput,
        rawOutput: output,
      });
    }
  });
});

export default router;