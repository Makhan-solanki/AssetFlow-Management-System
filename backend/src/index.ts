import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import orgRouter from './routes/org';
import assetRouter from './routes/asset';
import allocationRouter from './routes/allocation';
import bookingRouter from './routes/booking';
import maintenanceRouter from './routes/maintenance';
import auditRouter from './routes/audit';
import dashboardRouter from './routes/dashboard';
import { errorHandler } from './middlewares/error';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Set secure HTTP headers

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Custom XSS Sanitizer Middleware
function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/<[^>]*>/g, ''); // Strip HTML tags to prevent XSS
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj !== null && typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = sanitizeInput(obj[key]);
    }
    return res;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
});

// Middlewares
app.use(cors({
  origin: '*', // For development, allow all origins
  credentials: true,
}));
app.use(express.json());

// Basic check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/org', orgRouter);
app.use('/api/assets', assetRouter);
app.use('/api/allocations', allocationRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/audits', auditRouter);
app.use('/api/dashboard', dashboardRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AssetFlow backend running on port ${PORT}`);
});
