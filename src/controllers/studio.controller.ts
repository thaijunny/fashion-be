import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { StudioColor } from '../entities/StudioColor.js';
import { Asset } from '../entities/Asset.js';
import { GarmentTemplate } from '../entities/GarmentTemplate.js';

const studioColorRepo = () => AppDataSource.getRepository(StudioColor);
const assetRepo = () => AppDataSource.getRepository(Asset);
const templateRepo = () => AppDataSource.getRepository(GarmentTemplate);

// ── STUDIO COLORS ───────────────────────────────────────────────────

export const getAllStudioColors = async (_req: Request, res: Response) => {
    try {
        const items = await studioColorRepo().find({
            where: { is_active: true },
            order: { name: 'ASC' }
        });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createStudioColor = async (req: Request, res: Response) => {
    try {
        const { name, hex_code } = req.body;
        const item = studioColorRepo().create({ name, hex_code });
        await studioColorRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateStudioColor = async (req: Request, res: Response) => {
    try {
        const item = await studioColorRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        studioColorRepo().merge(item, req.body);
        const updated = await studioColorRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteStudioColor = async (req: Request, res: Response) => {
    try {
        const result = await studioColorRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

// ── ASSETS (STICKERS, ICONS, SHAPES, FONTS) ──────────────────────────

export const getAllAssets = async (req: Request, res: Response) => {
    const { type } = req.query;
    try {
        const where: any = {};
        if (type) where.type = type as string;
        const items = await assetRepo().find({
            where,
            order: { created_at: 'DESC' }
        });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createAsset = async (req: Request, res: Response) => {
    try {
        const { name, type, url } = req.body;
        const item = assetRepo().create({ name, type, url });
        await assetRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateAsset = async (req: Request, res: Response) => {
    try {
        const item = await assetRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        assetRepo().merge(item, req.body);
        const updated = await assetRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteAsset = async (req: Request, res: Response) => {
    try {
        const result = await assetRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

// ── GARMENT TEMPLATES ───────────────────────────────────────────────

export const getAllTemplates = async (_req: Request, res: Response) => {
    try {
        const items = await templateRepo().find({
            where: { is_active: true },
            order: { name: 'ASC' }
        });
        res.json(items);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const item = templateRepo().create(req.body);
        await templateRepo().save(item);
        res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const item = await templateRepo().findOneBy({ id: req.params.id as string });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        templateRepo().merge(item, req.body);
        const updated = await templateRepo().save(item);
        res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const result = await templateRepo().delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
};
