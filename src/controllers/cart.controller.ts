import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { CartItem } from '../entities/CartItem.js';
import { Product } from '../entities/Product.js';

const cartRepo = () => AppDataSource.getRepository(CartItem);
const productRepo = () => AppDataSource.getRepository(Product);

// Transform cart item for frontend
const toFrontendItem = (item: CartItem) => ({
  id: item.id,
  quantity: item.quantity,
  size: item.size,
  color: item.color,
  product: item.product ? {
    id: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    originalPrice: item.product.original_price ? Number(item.product.original_price) : undefined,
    images: item.product.images || [],
    category: item.product.category,
  } : null,
  project_id: item.project_id,
});

export const getCart = async (req: any, res: Response) => {
  const user_id = req.user.id;

  try {
    const items = await cartRepo().find({
      where: { user_id },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });

    const cartItems = items.map(toFrontendItem);
    const total = items.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + price * item.quantity;
    }, 0);

    res.status(200).json({ items: cartItems, total, itemCount: items.reduce((s, i) => s + i.quantity, 0) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: any, res: Response) => {
  const { product_id, project_id, size, color, quantity = 1 } = req.body;
  const user_id = req.user.id;

  try {
    // Check if product exists
    if (product_id) {
      const product = await productRepo().findOneBy({ id: product_id });
      if (!product) return res.status(404).json({ message: 'Product not found' });
    }

    // Check for existing item with same product+size+color
    if (product_id) {
      const existing = await cartRepo().findOneBy({ user_id, product_id, size, color });
      if (existing) {
        existing.quantity += quantity;
        const updated = await cartRepo().save(existing);
        // Re-fetch with relations
        const full = await cartRepo().findOne({ where: { id: updated.id }, relations: ['product'] });
        return res.status(200).json(toFrontendItem(full!));
      }
    }

    const item = cartRepo().create({ user_id, product_id, project_id, size, color, quantity });
    await cartRepo().save(item);
    const full = await cartRepo().findOne({ where: { id: item.id }, relations: ['product'] });
    res.status(201).json(toFrontendItem(full!));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req: any, res: Response) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await cartRepo().delete({ id, user_id });
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req: any, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.id;

  try {
    const item = await cartRepo().findOne({ where: { id, user_id }, relations: ['product'] });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    if (quantity <= 0) {
      await cartRepo().delete({ id, user_id });
      return res.status(200).json({ message: 'Item removed' });
    }
    item.quantity = quantity;
    const updated = await cartRepo().save(item);
    res.status(200).json(toFrontendItem(updated));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
