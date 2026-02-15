import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './config/data-source.js';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import studioRoutes from './routes/studio.routes.js';
import categoryRoutes from './routes/category.routes.js';
import attributeRoutes from './routes/attribute.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import designOrderRoutes from './routes/designOrder.routes.js';
import userRoutes from './routes/user.routes.js';
import settingRoutes from './routes/setting.routes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/assets', studioRoutes); // Keep compatibility for now
app.use('/api/categories', categoryRoutes);
app.use('/api', attributeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/design-orders', designOrderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize TypeORM then start server
AppDataSource.initialize()
  .then(() => {
    console.log('📦 TypeORM DataSource initialized – tables synced from entities');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error initializing DataSource:', error);
    process.exit(1);
  });

export default app;
