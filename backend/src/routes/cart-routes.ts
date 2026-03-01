import { Router } from 'express';
import { addCartItem, decrementCartItem, getMyCart, removeCartItem } from '../controllers/cart-controller';

const router = Router();

router.get('/me', getMyCart);
router.post('/items', addCartItem);
router.patch('/items/:productId/decrement', decrementCartItem);
router.delete('/items/:productId', removeCartItem);

export default router;
