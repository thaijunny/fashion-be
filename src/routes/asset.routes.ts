import { Router } from 'express';
import { getAllAssets, createAsset, deleteAsset } from '../controllers/asset.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllAssets);

// Admin only routes
router.post('/', protect, isAdmin, createAsset);
router.delete('/:id', protect, isAdmin, deleteAsset);

export default router;
