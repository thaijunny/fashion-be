import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './Project.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true })
  original_price: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  sizes: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  colors: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_new: boolean;

  @Column({ type: 'boolean', default: false })
  is_best_seller: boolean;

  @Column({ type: 'boolean', default: false })
  is_on_sale: boolean;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => Project, (project) => project.product)
  projects: Project[];
}
