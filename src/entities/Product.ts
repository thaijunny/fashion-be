import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project.js';
import { Category } from './Category.js';
import { ProductSize } from './ProductSize.js';
import { ProductColor } from './ProductColor.js';
import { ProductMaterial } from './ProductMaterial.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Category, (cat) => cat.products, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  categoryEntity: Category;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

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

  @OneToMany(() => ProductSize, (ps) => ps.product, { cascade: true })
  productSizes: ProductSize[];

  @OneToMany(() => ProductColor, (pc) => pc.product, { cascade: true })
  productColors: ProductColor[];

  @OneToMany(() => ProductMaterial, (pm) => pm.product, { cascade: true })
  productMaterials: ProductMaterial[];

  @OneToMany(() => Project, (project) => project.product)
  projects: Project[];
}
