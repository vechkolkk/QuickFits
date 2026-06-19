import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

function buildAllowedOrigins() {
  const configuredOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()).filter(Boolean) || [];

  if (process.env.NODE_ENV !== 'production') {
    configuredOrigins.push(
      'http://localhost:4001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177'
    );
  }

  return [...new Set(configuredOrigins)];
}

export function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'quickfit-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/routines', routineRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
