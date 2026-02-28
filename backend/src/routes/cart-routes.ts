import { Router } from 'express';
import { getMyCart } from '../controllers/cart-controller';

const router = Router();

router.get('/me', getMyCart);

export default router;
