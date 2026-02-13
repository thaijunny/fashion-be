import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Product } from './Product.js';
import { GarmentTemplate } from './GarmentTemplate.js';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  garment_template_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  preview_front: string;

  @Column({ type: 'text', nullable: true })
  preview_back: string;

  @Column({ type: 'jsonb' })
  design_data: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'white' })
  garment_color: string;

  @Column({ type: 'varchar', length: 20, default: 'L' })
  garment_size: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  garment_material: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.projects)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => GarmentTemplate, { nullable: true })
  @JoinColumn({ name: 'garment_template_id' })
  garment_template: GarmentTemplate;
}
