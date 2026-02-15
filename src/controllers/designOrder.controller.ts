import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { DesignOrder } from '../entities/DesignOrder.js';
import { Project } from '../entities/Project.js';
import { GarmentTemplate } from '../entities/GarmentTemplate.js';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const designOrderRepo = () => AppDataSource.getRepository(DesignOrder);
const projectRepo = () => AppDataSource.getRepository(Project);

// ─── USER: Create design order ─────────────────────────────────────
export const createDesignOrder = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user.id;
        const { project_id, garment_size, garment_color, quantity, shipping_address, full_name, phone_number, note, payment_method } = req.body;

        if (!project_id) return res.status(400).json({ message: 'Thiếu project_id' });

        // Fetch project to get template info
        const project = await projectRepo().findOne({
            where: { id: project_id, user_id },
            relations: ['garment_template'],
        });
        if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

        // Calculate price from template size_prices
        let unitPrice = 0;
        if (project.garment_template) {
            const sizeP = project.garment_template.size_prices || {};
            unitPrice = sizeP[garment_size] || Number(project.garment_template.base_price) || 0;
        }
        const total_amount = unitPrice * (quantity || 1);

        const order = designOrderRepo().create({
            user_id,
            project_id,
            garment_template_id: project.garment_template_id,
            garment_size: garment_size || project.garment_size,
            garment_color: garment_color || project.garment_color,
            quantity: quantity || 1,
            total_amount,
            shipping_address,
            full_name,
            phone_number,
            note,
            payment_method: payment_method || 'cod',
        });
        const saved = await designOrderRepo().save(order);
        res.status(201).json(saved);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// ─── USER: Get my design orders ────────────────────────────────────
export const getMyDesignOrders = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user.id;
        const orders = await designOrderRepo().find({
            where: { user_id },
            relations: ['project', 'garment_template'],
            order: { created_at: 'DESC' },
        });
        res.json(orders);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// ─── USER/ADMIN: Get design order by ID ────────────────────────────
export const getDesignOrderById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = (req as any).user;
        const order = await designOrderRepo().findOne({
            where: { id },
            relations: ['project', 'garment_template', 'user'],
        });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        // Only owner or admin can view
        if (order.user_id !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Không có quyền' });
        }
        res.json(order);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// ─── ADMIN: Get all design orders ──────────────────────────────────
export const getAllDesignOrdersAdmin = async (req: Request, res: Response) => {
    try {
        const orders = await designOrderRepo().find({
            relations: ['project', 'garment_template', 'user'],
            order: { created_at: 'DESC' },
        });
        res.json(orders);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// ─── ADMIN: Update design order status ─────────────────────────────
export const updateDesignOrderStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const valid = ['pending', 'confirmed', 'printing', 'shipped', 'done', 'cancelled'];
        if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

        const order = await designOrderRepo().findOneBy({ id });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        order.status = status;
        const updated = await designOrderRepo().save(order);
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

// ─── ADMIN: Download design order as ZIP ───────────────────────────
export const downloadDesignOrderZip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const order = await designOrderRepo().findOne({
            where: { id },
            relations: ['project', 'garment_template'],
        });
        if (!order || !order.project) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        const project = order.project;
        const archive = archiver('zip', { zlib: { level: 9 } });
        const safeName = (project.name || 'design').replace(/[^a-zA-Z0-9_\-]/g, '_');

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_print.zip"`);
        archive.pipe(res);

        // Add preview images (base64 → buffer)
        if (project.preview_front) {
            const match = project.preview_front.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
            if (match) {
                archive.append(Buffer.from(match[2], 'base64'), { name: `${safeName}_front.${match[1]}` });
            }
        }
        if (project.preview_back) {
            const match = project.preview_back.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
            if (match) {
                archive.append(Buffer.from(match[2], 'base64'), { name: `${safeName}_back.${match[1]}` });
            }
        }

        // Add design element images (uploaded files on server)
        const designData = project.design_data || {};
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        const addedFiles = new Set<string>();

        const extractImages = (elements: any[]) => {
            if (!Array.isArray(elements)) return;
            elements.forEach((el: any) => {
                if (el.type === 'image' && el.content && el.content.startsWith('/uploads/')) {
                    const filePath = path.join(uploadsDir, el.content.replace('/uploads/', ''));
                    if (fs.existsSync(filePath) && !addedFiles.has(el.content)) {
                        addedFiles.add(el.content);
                        archive.file(filePath, { name: `assets/${path.basename(filePath)}` });
                    }
                }
                if (el.type === 'sticker' && el.content && el.content.startsWith('/uploads/')) {
                    const filePath = path.join(uploadsDir, el.content.replace('/uploads/', ''));
                    if (fs.existsSync(filePath) && !addedFiles.has(el.content)) {
                        addedFiles.add(el.content);
                        archive.file(filePath, { name: `assets/${path.basename(filePath)}` });
                    }
                }
            });
        };

        extractImages(designData.front);
        extractImages(designData.back);

        // Add order info as JSON
        archive.append(JSON.stringify({
            order_id: order.id,
            project_name: project.name,
            garment_size: order.garment_size,
            garment_color: order.garment_color,
            quantity: order.quantity,
            template: order.garment_template?.name || 'N/A',
            design_data: designData,
        }, null, 2), { name: 'order_info.json' });

        await archive.finalize();
    } catch (e: any) {
        console.error('ZIP download error:', e);
        if (!res.headersSent) res.status(500).json({ message: e.message });
    }
};
