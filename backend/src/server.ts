import 'dotenv/config';
import './config/env.js'; // Load and validate env vars first
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { valkey } from './config/valkey.js';
import { connectNats } from './config/nats.js';
import { startConsumers } from './services/eventbus.consumer.js';

const app = express();

// Stripe webhook needs raw body — must come BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to infrastructure (non-blocking — server starts regardless)
valkey.connect().catch((err) => {
  console.warn('Valkey connection failed (non-fatal):', err.message);
});

connectNats()
  .then(() => startConsumers())
  .catch((err) => {
    console.warn('NATS connection failed (non-fatal):', err.message);
  });

app.listen(env.PORT, () => {
  console.log(`Arbeitly backend running on http://localhost:${env.PORT}`);
});

export default app;
