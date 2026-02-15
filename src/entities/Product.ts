import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import type { Project } from './Project.js';
import type { Category } from './Category.js';
import type { ProductSize } from './ProductSize.js';
import type { ProductColor } from './ProductColor.js';
import type { ProductMaterial } from './ProductMaterial.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne('Category', 'products', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  categoryEntity: Relation<Category>;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true })
  original_price: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_new: boolean;

  @Column({ type: 'boolean', default: false })
  is_best_seller: boolean;

  @Column({ type: 'boolean', default: false })
  is_on_sale: boolean;

  @Column({ type: 'boolean', default: false })
  is_hidden: boolean;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany('ProductSize', 'product', { cascade: true })
  productSizes: Relation<ProductSize>[];

  @OneToMany('ProductColor', 'product', { cascade: true })
  productColors: Relation<ProductColor>[];

  @OneToMany('ProductMaterial', 'product', { cascade: true })
  productMaterials: Relation<ProductMaterial>[];

  @OneToMany('Project', 'product')
  projects: Relation<Project>[];
}
