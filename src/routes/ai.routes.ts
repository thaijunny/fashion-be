import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect } from '../middleware/auth.middleware.js';
import { getUsage, getHistory, generateImage, reviewImage, safetyCheck } from '../controllers/ai.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '..', '..', 'uploads', 'temp');
fs.mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({
    dest: TEMP_DIR,
    limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/usage', protect, getUsage);
router.get('/history', protect, getHistory);
router.post('/generate', protect, generateImage);
router.post('/review', protect, upload.single('image'), reviewImage);
router.post('/safety', protect, upload.single('image'), safetyCheck);

export default router;
