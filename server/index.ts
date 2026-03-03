import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import cors from "cors";

import activityRoutes from "./routes/activity.routes";
import seasonRoutes from "./routes/season.routes";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import soilCropRoutes from "./routes/soilCrop.routes.js";
import plantRoutes from "./routes/plant.routes";

const app = express();
const httpServer = createServer(app);

// ================= CORS =================
app.use(cors({
  origin: true,
  credentials: true,
}));

// ================= BODY PARSING =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= SESSION =================
app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only in production HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ================= LOGGER =================
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`
      );
    }
  });

  next();
});

// ================= ROUTES =================
app.use("/api/soil", soilCropRoutes);
app.use("/api/plant", plantRoutes);
app.use("/api/seasonal-tips", seasonRoutes);
app.use("/api/activity", activityRoutes);

(async () => {

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

})();