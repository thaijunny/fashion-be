import { Router } from 'express';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import {
    createDesignOrder,
    getMyDesignOrders,
    getDesignOrderById,
    getAllDesignOrdersAdmin,
    updateDesignOrderStatus,
    downloadDesignOrderZip,
} from '../controllers/designOrder.controller.js';

const router = Router();

// User routes
router.post('/', protect, createDesignOrder);
router.get('/my', protect, getMyDesignOrders);
router.get('/:id', protect, getDesignOrderById);

// Admin routes
router.get('/', protect, isAdmin, getAllDesignOrdersAdmin);
router.put('/:id/status', protect, isAdmin, updateDesignOrderStatus);
router.get('/:id/download', protect, isAdmin, downloadDesignOrderZip);

export default router;
