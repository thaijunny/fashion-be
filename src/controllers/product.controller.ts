import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';
import { Category } from '../entities/Category.js';
import { ProductSize } from '../entities/ProductSize.js';
import { ProductColor } from '../entities/ProductColor.js';
import { ProductMaterial } from '../entities/ProductMaterial.js';

const productRepo = () => AppDataSource.getRepository(Product);
const productSizeRepo = () => AppDataSource.getRepository(ProductSize);
const productColorRepo = () => AppDataSource.getRepository(ProductColor);
const productMaterialRepo = () => AppDataSource.getRepository(ProductMaterial);
const categoryRepo = () => AppDataSource.getRepository(Category);

// Transform DB row to frontend-friendly format
const toFrontendProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  images: p.images || [],
  category: p.categoryEntity
    ? {
      id: p.categoryEntity.id,
      name: p.categoryEntity.name,
      slug: p.categoryEntity.slug,
      size_guide_image: p.categoryEntity.size_guide_image
    }
    : null,
  sizes: (p.productSizes || []).map(ps => ({
    id: ps.size.id,
    name: ps.size.name,
    priceAdjustment: Number(ps.price_adjustment),
  })),
  colors: (p.productColors || []).map(pc => ({
    id: pc.color.id,
    name: pc.color.name,
    hexCode: pc.color.hex_code,
    priceAdjustment: Number(pc.price_adjustment),
  })),
  materials: (p.productMaterials || []).map(pm => ({
    id: pm.material.id,
    name: pm.material.name,
    priceAdjustment: Number(pm.price_adjustment),
  })),
  description: p.description,
  isNew: p.is_new,
  isBestSeller: p.is_best_seller,
  isOnSale: p.is_on_sale,
  isHidden: p.is_hidden,
  configuration: p.configuration,
  createdAt: p.created_at,
});

const PRODUCT_RELATIONS = [
  'categoryEntity',
  'productSizes',
  'productSizes.size',
  'productColors',
  'productColors.color',
  'productMaterials',
  'productMaterials.material',
];

export const getAllProducts = async (req: any, res: Response) => {
  try {
    const { category, search, page = 1, limit = 12, isAdminView } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const queryBuilder = productRepo().createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryEntity', 'category')
      .leftJoinAndSelect('product.productSizes', 'productSizes')
      .leftJoinAndSelect('productSizes.size', 'size')
      .leftJoinAndSelect('product.productColors', 'productColors')
      .leftJoinAndSelect('productColors.color', 'color')
      .leftJoinAndSelect('product.productMaterials', 'productMaterials')
      .leftJoinAndSelect('productMaterials.material', 'material');

    // 1. Category filter (by slug)
    if (category && typeof category === 'string') {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    // 2. Search by name
    if (search && typeof search === 'string') {
      queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    // 3. Visibility
    const isActuallyAdmin = req.user?.role === 'admin' && isAdminView === 'true';
    if (!isActuallyAdmin) {
      queryBuilder.andWhere('product.is_hidden = :isHidden', { isHidden: false });
    }

    // 4. Paging & Sorting
    queryBuilder.orderBy('product.created_at', 'DESC');
    queryBuilder.skip(skip).take(l);

    const [products, total] = await queryBuilder.getManyAndCount();

    res.status(200).json({
      items: products.map(toFrontendProduct),
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productRepo().findOne({
      where: { id: req.params.id as string },
      relations: PRODUCT_RELATIONS,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(toFrontendProduct(product));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const {
    name, category_id, price, original_price, images,
    sizes, colors, materials, description,
    is_new, is_best_seller, is_on_sale, configuration
  } = req.body;
  try {
    const product = productRepo().create({
      name, category_id, price, original_price, images,
      description, is_new, is_best_seller, is_on_sale, configuration,
    });

    await productRepo().save(product);

    // Save junction rows
    if (sizes?.length) {
      const sizeRows = sizes.map((s: any) =>
        productSizeRepo().create({ product_id: product.id, size_id: s.sizeId, price_adjustment: s.price_adjustment || s.priceAdjustment || 0 })
      );
      await productSizeRepo().save(sizeRows);
    }
    if (colors?.length) {
      const colorRows = colors.map((c: any) =>
        productColorRepo().create({ product_id: product.id, color_id: c.colorId, price_adjustment: c.price_adjustment || c.priceAdjustment || 0 })
      );
      await productColorRepo().save(colorRows);
    }
    if (materials?.length) {
      const matRows = materials.map((m: any) =>
        productMaterialRepo().create({ product_id: product.id, material_id: m.materialId, price_adjustment: m.price_adjustment || m.priceAdjustment || 0 })
      );
      await productMaterialRepo().save(matRows);
    }

    // Reload with relations
    const saved = await productRepo().findOne({
      where: { id: product.id },
      relations: PRODUCT_RELATIONS,
    });
    res.status(201).json(toFrontendProduct(saved!));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const product = await productRepo().findOne({
      where: { id },
      relations: PRODUCT_RELATIONS,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { sizes, colors, materials, category_id, ...rest } = req.body;

    // Update scalar fields
    productRepo().merge(product, { ...rest, category_id });

    await productRepo().save(product);

    // Replace junction rows if provided
    if (sizes !== undefined) {
      await productSizeRepo().delete({ product_id: id });
      if (sizes.length) {
        const rows = sizes.map((s: any) =>
          productSizeRepo().create({ product_id: id, size_id: s.sizeId, price_adjustment: s.price_adjustment || s.priceAdjustment || 0 })
        );
        await productSizeRepo().save(rows);
      }
    }
    if (colors !== undefined) {
      await productColorRepo().delete({ product_id: id });
      if (colors.length) {
        const rows = colors.map((c: any) =>
          productColorRepo().create({ product_id: id, color_id: c.colorId, price_adjustment: c.price_adjustment || c.priceAdjustment || 0 })
        );
        await productColorRepo().save(rows);
      }
    }
    if (materials !== undefined) {
      await productMaterialRepo().delete({ product_id: id });
      if (materials.length) {
        const rows = materials.map((m: any) =>
          productMaterialRepo().create({ product_id: id, material_id: m.materialId, price_adjustment: m.price_adjustment || m.priceAdjustment || 0 })
        );
        await productMaterialRepo().save(rows);
      }
    }

    // Reload
    const reloaded = await productRepo().findOne({
      where: { id: id as string },
      relations: PRODUCT_RELATIONS,
    });
    res.json(toFrontendProduct(reloaded!));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productRepo().findOneBy({ id: req.params.id as string });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Soft delete: toggle visibility
    product.is_hidden = !product.is_hidden;
    await productRepo().save(product);

    res.json({
      message: product.is_hidden ? 'Product hidden' : 'Product shown',
      isHidden: product.is_hidden
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
