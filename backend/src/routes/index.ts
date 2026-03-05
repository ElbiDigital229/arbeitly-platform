import type { Express } from "express";
import { Router } from "express";

const router = Router();

export function registerRoutes(app: Express): void {
  app.use("/api", router);
}
