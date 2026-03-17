import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFound } from './middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: 'Juda ko\'p so\'rovlar. Biroz kuting.' },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
