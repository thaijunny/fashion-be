import { Router } from 'express';
import {
    getAllStudioColors, createStudioColor, updateStudioColor, deleteStudioColor,
    getAllAssets, createAsset, updateAsset, deleteAsset,
    getAllTemplates, createTemplate, updateTemplate, deleteTemplate
} from '../controllers/studio.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ── STUDIO COLORS ───────────────────────────────────────────────────
router.get('/colors', getAllStudioColors);
router.post('/colors', protect, isAdmin, createStudioColor);
router.put('/colors/:id', protect, isAdmin, updateStudioColor);
router.delete('/colors/:id', protect, isAdmin, deleteStudioColor);

// ── ASSETS ──────────────────────────────────────────────────────────
router.get('/assets', getAllAssets);
router.post('/assets', protect, isAdmin, createAsset);
router.put('/assets/:id', protect, isAdmin, updateAsset);
router.delete('/assets/:id', protect, isAdmin, deleteAsset);

// ── GARMENT TEMPLATES ───────────────────────────────────────────────
router.get('/templates', getAllTemplates);
router.post('/templates', protect, isAdmin, createTemplate);
router.put('/templates/:id', protect, isAdmin, updateTemplate);
router.delete('/templates/:id', protect, isAdmin, deleteTemplate);

export default router;
