import { Router } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllCategories);
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
