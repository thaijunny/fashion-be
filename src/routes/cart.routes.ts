import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateQuantity } from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/:id', updateQuantity);
router.delete('/:id', removeFromCart);

export default router;
