import 'dotenv/config';
import './config/env.js'; // Load and validate env vars first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { taxonomyService } from './services/taxonomy.service.js';

const app = express();

// Security middleware
app.use(helmet());
// Allow localhost + private LAN origins (192.168.x.x, 10.x.x.x, 172.16-31.x.x) on any port
const LAN_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser clients (curl, mobile native)
    if (env.FRONTEND_URL && origin === env.FRONTEND_URL) return cb(null, true);
    if (LAN_ORIGIN_RE.test(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook needs raw body before JSON parsing
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, async () => {
  console.log(`Arbeitly backend running on http://localhost:${env.PORT}`);
  try {
    await taxonomyService.syncFromSeed();
  } catch (err) {
    console.error('[taxonomy] seed sync failed:', err);
  }
});

export default app;
