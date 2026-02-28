import { Router } from 'express';
import healthRoutes from './health-routes';
import authRoutes from './auth-routes';
import categoriesRoutes from './categories-routes';
import productsRoutes from './products-routes';
import cartRoutes from './cart-routes';
import ordersRoutes from './orders-routes';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/cart', requireAuth, requireRoles(['client', 'admin']), cartRoutes);
router.use('/orders', requireAuth, requireRoles(['client', 'admin']), ordersRoutes);

export default router;
