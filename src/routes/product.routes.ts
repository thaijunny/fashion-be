import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect, isAdmin, optionalProtect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalProtect, getAllProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
