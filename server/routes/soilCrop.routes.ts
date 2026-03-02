import express from "express";
import multer from "multer";
import { spawn } from "child_process";

const router = express.Router();

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= TEST =================
router.get("/", (_req, res) => {
  res.send("✅ Soil API Working");
});

// ================= ANALYZE =================
router.post("/analyze", upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Image missing" });
  }

  // ===== GET VALUES =====
  const {
    nitrogen = 0,
    phosphorus = 0,
    potassium = 0,
    ph = 7,
    location = "India",
  } = req.body;

  // ===== CONVERT TO NUMBER =====
  const N = Number(nitrogen);
  const P = Number(phosphorus);
  const K = Number(potassium);
  const PH = Number(ph);

  // ===== RANGE VALIDATION =====
  if (
    isNaN(N) || isNaN(P) || isNaN(K) || isNaN(PH)
  ) {
    return res.status(400).json({
      error: "NPK and pH must be numeric values"
    });
  }

  if (
    N < 0 || N > 140 ||
    P < 5 || P > 145 ||
    K < 5 || K > 205 ||
    PH < 3.5 || PH > 9.5
  ) {
    return res.status(400).json({
      error: "Invalid soil values",
      allowedRange: {
        nitrogen: "0–140",
        phosphorus: "5–145",
        potassium: "5–205",
        ph: "3.5–9.5"
      }
    });
  }

  // ===== CALL PYTHON PIPELINE =====
  const python = spawn("python", [
    "script/pipeline/predict_pipeline.py",
    req.file.path,
    N,
    P,
    K,
    PH,
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

  python.on("close", () => {

    console.log("PYTHON RAW OUTPUT:\n", output);

    try {
      // ===== SAFE JSON EXTRACTION =====
      const jsonStart = output.indexOf("{");
      const jsonEnd = output.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("JSON not found in Python output");
      }

      const jsonString = output.slice(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);

      res.json(result);

    } catch (err) {
      console.error("PARSE ERROR:", err);

      res.status(500).json({
        error: "Prediction failed",
        pythonError: errorOutput,
        rawOutput: output,
      });
    }
  });
});

export default router;