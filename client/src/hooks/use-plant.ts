import express from "express";
import multer from "multer";
import { spawn } from "child_process";

const router = express.Router();

// Upload config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =============================
// PLANT DISEASE ROUTE
// =============================
router.post("/analyze", upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  // 🔥 THIS IS WHERE SPAWN IS CALLED
  const python = spawn("python", [
    "script/pipeline/plant_disease_pipeline.py",
    req.file.path,
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
    try {
      const jsonStart = output.indexOf("{");
      const jsonEnd = output.lastIndexOf("}");
      const jsonString = output.slice(jsonStart, jsonEnd + 1);

      const result = JSON.parse(jsonString);
      res.json(result);

    } catch (err) {
      res.status(500).json({
        error: "Prediction failed",
        pythonError: errorOutput,
        rawOutput: output,
      });
    }
  });
});

export default router;