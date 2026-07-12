import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
