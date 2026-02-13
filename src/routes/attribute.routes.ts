import { Router } from 'express';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import {
    getAllSizes, createSize, updateSize, deleteSize,
    getAllColors, createColor, updateColor, deleteColor,
    getAllMaterials, createMaterial, updateMaterial, deleteMaterial,
} from '../controllers/attribute.controller.js';

const router = Router();

// Sizes
router.get('/sizes', getAllSizes);
router.post('/sizes', protect, isAdmin, createSize);
router.put('/sizes/:id', protect, isAdmin, updateSize);
router.delete('/sizes/:id', protect, isAdmin, deleteSize);

// Colors
router.get('/colors', getAllColors);
router.post('/colors', protect, isAdmin, createColor);
router.put('/colors/:id', protect, isAdmin, updateColor);
router.delete('/colors/:id', protect, isAdmin, deleteColor);

// Materials
router.get('/materials', getAllMaterials);
router.post('/materials', protect, isAdmin, createMaterial);
router.put('/materials/:id', protect, isAdmin, updateMaterial);
router.delete('/materials/:id', protect, isAdmin, deleteMaterial);

export default router;
