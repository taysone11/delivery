import { Router } from 'express';
import { addCartItem, getMyCart, removeCartItem } from '../controllers/cart-controller';

const router = Router();

router.get('/me', getMyCart);
router.post('/items', addCartItem);
router.delete('/items/:productId', removeCartItem);

export default router;
