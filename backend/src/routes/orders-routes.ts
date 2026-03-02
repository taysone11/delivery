import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orders-controller';

const router = Router();

router.get('/my', getMyOrders);
router.post('/', createOrder);

export default router;
