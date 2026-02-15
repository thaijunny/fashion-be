import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Category } from '../entities/Category.js';

const categoryRepo = () => AppDataSource.getRepository(Category);

export const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await categoryRepo()
            .createQueryBuilder('category')
            .loadRelationCountAndMap('category.productCount', 'category.products')
            .orderBy('category.name', 'ASC')
            .getMany();
        res.status(200).json(categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.image,
            size_guide_image: c.size_guide_image,
            productCount: c.productCount || 0,
            createdAt: c.created_at,
        })));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name, slug, image, size_guide_image } = req.body;
    try {
        // Check for duplicate slug
        const existing = await categoryRepo().findOneBy({ slug });
        if (existing) {
            return res.status(400).json({ message: 'Slug đã tồn tại' });
        }
        const category = categoryRepo().create({ name, slug, image, size_guide_image });
        await categoryRepo().save(category);
        res.status(201).json({
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image,
            size_guide_image: category.size_guide_image,
            createdAt: category.created_at,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const category = await categoryRepo().findOneBy({ id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // If slug is being changed, check for duplicates
        if (req.body.slug && req.body.slug !== category.slug) {
            const existing = await categoryRepo().findOneBy({ slug: req.body.slug });
            if (existing) {
                return res.status(400).json({ message: 'Slug đã tồn tại' });
            }
        }
        categoryRepo().merge(category, req.body);
        const updated = await categoryRepo().save(category);
        res.status(200).json({
            id: updated.id,
            name: updated.name,
            slug: updated.slug,
            image: updated.image,
            size_guide_image: updated.size_guide_image,
            createdAt: updated.created_at,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const result = await categoryRepo().delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
