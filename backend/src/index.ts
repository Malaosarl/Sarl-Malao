import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import authRoutes from './routes/auth';
import productionRoutes from './routes/production';
import qualityRoutes from './routes/quality';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
import agropoleRoutes from './routes/agropole';
import maintenanceRoutes from './routes/maintenance';
import deliveryRoutes from './routes/delivery';
import costsRoutes from './routes/costs';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import pdfRoutes from './routes/pdf';
import notificationRoutes from './routes/notifications';
import excelRoutes from './routes/excel';
import contactRoutes from './routes/contact';
import rbacRoutes from './routes/rbac';
import workflowRoutes from './routes/workflows';
import iotRoutes from './routes/iot';
import entityRoutes from './routes/entities';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      cb(null, true);
    } else {
      cb(null, process.env.CORS_ORIGIN || 'http://localhost:3000');
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.get('/', (_req, res) => {
  res.redirect(302, '/health');
});
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'MALAO Production System API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});


app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/quality', qualityRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/agropole', agropoleRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/costs', costsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/pdf', pdfRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/excel', excelRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/iot', iotRoutes);
app.use('/api/v1/entities', entityRoutes);


app.use(notFoundHandler);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`🚀 MALAO Production System API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

