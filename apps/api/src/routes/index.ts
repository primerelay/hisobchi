import { Router } from 'express';
import authRoutes from './auth';
import menuItemsRoutes from './menuItems';
import roomsRoutes from './rooms';
import waitersRoutes from './waiters';
import ordersRoutes from './orders';
import analyticsRoutes from './analytics';
import restaurantRoutes from './restaurant';
import syncRoutes from './sync';
import superAdminRoutes from './superAdmin';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/menu-items', menuItemsRoutes);
router.use('/rooms', roomsRoutes);
router.use('/waiters', waitersRoutes);
router.use('/orders', ordersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/sync', syncRoutes);
router.use('/super-admin', superAdminRoutes);

export default router;
