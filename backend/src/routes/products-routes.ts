import { Router } from 'express';
import { getProductById, listProducts } from '../controllers/products-controller';

const router = Router();

router.get('/', listProducts);
router.get('/:productId', getProductById);

export default router;
