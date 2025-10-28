import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import visitPlanRoutes from './routes/visitPlans';
import visitReportRoutes from './routes/visitReports';
import articleRoutes from './routes/articles';
import invitationRoutes from './routes/invitations';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
// 允许的源列表
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.4:5173',
  process.env.FRONTEND_URL,
].filter(Boolean); // 过滤掉 undefined 值

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) {
      return callback(null, true);
    }
    
    // 检查 origin 是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/visit-plans', visitPlanRoutes);
app.use('/api/visit-reports', visitReportRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/invitations', invitationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网络接口

app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

