import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';

const productRepo = () => AppDataSource.getRepository(Product);

// Transform DB row to frontend-friendly format
const toFrontendProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  images: p.images || [],
  category: p.category,
  sizes: p.sizes || [],
  colors: p.colors || [],
  description: p.description,
  isNew: p.is_new,
  isBestSeller: p.is_best_seller,
  isOnSale: p.is_on_sale,
  configuration: p.configuration,
});

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category && typeof category === 'string') {
      where.category = category;
    }
    const products = await productRepo().find({ where, order: { created_at: 'DESC' } });
    res.status(200).json(products.map(toFrontendProduct));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const product = await productRepo().findOneBy({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(toFrontendProduct(product));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, category, price, original_price, images, sizes, colors, description, is_new, is_best_seller, is_on_sale, configuration } = req.body;
  try {
    const product = productRepo().create({ name, category, price, original_price, images, sizes, colors, description, is_new, is_best_seller, is_on_sale, configuration });
    await productRepo().save(product);
    res.status(201).json(toFrontendProduct(product));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const product = await productRepo().findOneBy({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    productRepo().merge(product, req.body);
    const updated = await productRepo().save(product);
    res.status(200).json(toFrontendProduct(updated));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const result = await productRepo().delete(id);
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
