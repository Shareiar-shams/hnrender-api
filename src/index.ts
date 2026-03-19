import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hnRoutes from './routes/hn';
import bookmarkRoutes from './routes/bookmarks';
import summaryRoutes from './routes/summary';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/hn', hnRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/summary', summaryRoutes);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});