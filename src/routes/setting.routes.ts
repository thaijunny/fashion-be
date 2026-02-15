import { Router } from 'express';
import { getAllSettings, updateSettings } from '../controllers/setting.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllSettings);
router.patch('/', protect, isAdmin, updateSettings);

export default router;
