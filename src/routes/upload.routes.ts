import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const STUDIO_DIR = path.join(BASE_UPLOAD_DIR, 'studio');
const PRODUCTS_DIR = path.join(BASE_UPLOAD_DIR, 'products');

// Ensure directories exist
fs.mkdirSync(STUDIO_DIR, { recursive: true });
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const folder = req.query.folder === 'products' ? 'products' : 'studio';
        cb(null, path.join(BASE_UPLOAD_DIR, folder));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

const router = Router();

router.post('/', protect, upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const folder = req.query.folder === 'products' ? 'products' : 'studio';
    const url = `/uploads/${folder}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

export default router;
