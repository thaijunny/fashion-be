import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import type { Project } from './Project.js';
import type { Order } from './Order.js';
import type { CartItem } from './CartItem.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: false })
  is_blocked: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'jsonb', default: [] })
  uploaded_images: string[];

  @Column({ type: 'jsonb', default: [] })
  ai_images: string[];

  @OneToMany('Project', 'user')
  projects: Relation<Project>[];

  @OneToMany('Order', 'user')
  orders: Relation<Order>[];

  @OneToMany('CartItem', 'user')
  cart_items: Relation<CartItem>[];
}
