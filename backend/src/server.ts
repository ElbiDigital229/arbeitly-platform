import 'dotenv/config';
import './config/env.js'; // Load and validate env vars first
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

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

app.listen(env.PORT, () => {
  console.log(`Arbeitly backend running on http://localhost:${env.PORT}`);
});

export default app;
