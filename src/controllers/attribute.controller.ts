import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Size } from '../entities/Size.js';
import { Color } from '../entities/Color.js';
import { Material } from '../entities/Material.js';

const sizeRepo = () => AppDataSource.getRepository(Size);
const colorRepo = () => AppDataSource.getRepository(Color);
const materialRepo = () => AppDataSource.getRepository(Material);

// ── SIZES ──────────────────────────────────────────────────────────

export const getAllSizes = async (_req: Request, res: Response) => {
    try {
        const items = await sizeRepo().find({ order: { name: 'ASC' } });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createSize = async (req: Request, res: Response) => {
    try {
        const { name, measurements } = req.body;
        const existing = await sizeRepo().findOneBy({ name });
        if (existing) return res.status(400).json({ message: 'Size đã tồn tại' });
        const item = sizeRepo().create({ name, measurements });
        await sizeRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateSize = async (req: Request, res: Response) => {
    try {
        const item = await sizeRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });

        const { name, measurements } = req.body;
        if (name) item.name = name;
        if (measurements) item.measurements = measurements;

        const updated = await sizeRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteSize = async (req: Request, res: Response) => {
    try {
        const result = await sizeRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

// ── COLORS ─────────────────────────────────────────────────────────

export const getAllColors = async (_req: Request, res: Response) => {
    try {
        const items = await colorRepo().find({ order: { name: 'ASC' } });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createColor = async (req: Request, res: Response) => {
    try {
        const { name, hex_code } = req.body;
        const existing = await colorRepo().findOneBy({ hex_code });
        if (existing) return res.status(400).json({ message: 'Mã màu đã tồn tại' });
        const item = colorRepo().create({ name, hex_code });
        await colorRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateColor = async (req: Request, res: Response) => {
    try {
        const item = await colorRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        colorRepo().merge(item, req.body);
        const updated = await colorRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteColor = async (req: Request, res: Response) => {
    try {
        const result = await colorRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

// ── MATERIALS ──────────────────────────────────────────────────────

export const getAllMaterials = async (_req: Request, res: Response) => {
    try {
        const items = await materialRepo().find({ order: { name: 'ASC' } });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createMaterial = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const existing = await materialRepo().findOneBy({ name });
        if (existing) return res.status(400).json({ message: 'Chất liệu đã tồn tại' });
        const item = materialRepo().create({ name });
        await materialRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateMaterial = async (req: Request, res: Response) => {
    try {
        const item = await materialRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        materialRepo().merge(item, req.body);
        const updated = await materialRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteMaterial = async (req: Request, res: Response) => {
    try {
        const result = await materialRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};
