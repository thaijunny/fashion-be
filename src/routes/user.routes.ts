import { Router } from 'express';
import { getAllUsers, toggleBlockUser, updateUserRole } from '../controllers/user.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/block', protect, isAdmin, toggleBlockUser);
router.put('/:id/role', protect, isAdmin, updateUserRole);

export default router;
