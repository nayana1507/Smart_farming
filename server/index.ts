import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import soilCropRoutes from "./routes/soilCrop.routes.js";
import plantRoutes from "./routes/plant.routes";

const app = express();
const httpServer = createServer(app);

// ================= MIDDLEWARE =================
app.use(cors());

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use(express.urlencoded({ extended: true }));

// ================= LOGGER =================
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// ================= ✅ YOUR API ROUTES =================
app.use("/api/soil", soilCropRoutes);
app.use("/api/plant", plantRoutes);
// ================= OTHER ROUTES =================
(async () => {

  await registerRoutes(httpServer, app);

  // ERROR HANDLER
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  // ================= FRONTEND =================
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ================= SERVER =================
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(port, () => {
    log(`Server running at http://localhost:${port}`);
  });

})();