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
  material: item.material,
  project_id: item.project_id,
  product: item.product ? {
    id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    images: item.product.images,
    category: item.product.categoryEntity?.name,
  } : null,
});

export const getCart = async (req: any, res: Response) => {
  const user_id = req.user.id;

  try {
    const items = await cartRepo().find({
      where: { user_id },
      relations: [
        'product',
        'product.categoryEntity',
        'product.productSizes',
        'product.productSizes.size',
        'product.productColors',
        'product.productColors.color',
        'product.productMaterials',
        'product.productMaterials.material'
      ],
      order: { created_at: 'DESC' },
    });

    const cartItems = items.map(toFrontendItem);
    const total = items.reduce((sum, item) => {
      if (!item.product) return sum;

      let price = Number(item.product.price);

      // Add adjustments from junctions
      if (item.size) {
        const sizeAdj = item.product.productSizes?.find(ps => ps.size?.name === item.size);
        if (sizeAdj) price += Number(sizeAdj.price_adjustment);
      }
      if (item.color) {
        const colorAdj = item.product.productColors?.find(pc => pc.color?.hex_code === item.color);
        if (colorAdj) price += Number(colorAdj.price_adjustment);
      }
      if (item.material) {
        const matAdj = item.product.productMaterials?.find(pm => pm.material?.name === item.material);
        if (matAdj) price += Number(matAdj.price_adjustment);
      }

      return sum + (price * item.quantity);
    }, 0);

    res.status(200).json({ items: cartItems, total, itemCount: items.reduce((s, i) => s + i.quantity, 0) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: any, res: Response) => {
  const { product_id, project_id, size, color, material, quantity = 1 } = req.body;
  const user_id = req.user.id;

  try {
    // Check if product exists
    if (product_id) {
      const product = await productRepo().findOneBy({ id: product_id });
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // Check for existing item with same product+size+color+material
      const existing = await cartRepo().findOneBy({ user_id, product_id, size, color, material });
      if (existing) {
        existing.quantity += quantity;
        const updated = await cartRepo().save(existing);
        const full = await cartRepo().findOne({ where: { id: updated.id }, relations: ['product', 'product.categoryEntity'] });
        return res.status(200).json(toFrontendItem(full!));
      }
    }

    const item = cartRepo().create({ user_id, product_id, project_id, size, color, material, quantity });
    await cartRepo().save(item);
    const full = await cartRepo().findOne({ where: { id: item.id }, relations: ['product', 'product.categoryEntity'] });
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
