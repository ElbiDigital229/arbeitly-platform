import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.ts";
import { registerRoutes } from "./routes/index.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

registerRoutes(app);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
});

export default app;
