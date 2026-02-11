import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/checkout', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

export default router;
