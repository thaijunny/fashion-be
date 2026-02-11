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

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

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

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.projects)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
