import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    Relation,
} from 'typeorm';
import type { Product } from './Product.js';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    image: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    size_guide_image: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @OneToMany('Product', 'categoryEntity')
    products: Relation<Product>[];
}
