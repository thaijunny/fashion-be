import { Router } from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const checkoutSchema = z.object({
    full_name: z.string().min(2, 'Họ tên quá ngắn'),
    phone_number: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    shipping_address: z.string().min(10, 'Địa chỉ quá ngắn'),
    payment_method: z.enum(['cod', 'bank_transfer']),
    total_amount: z.number().positive(),
});

const statusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

router.use(protect);

// User routes
router.post('/checkout', validate(checkoutSchema), createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/admin/all', isAdmin, getAllOrders);
router.patch('/:id/status', isAdmin, validate(statusSchema), updateOrderStatus);

export default router;
