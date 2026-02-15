import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import type { Product } from './Product.js';
import type { Size } from './Size.js';

@Entity('product_sizes')
export class ProductSize {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    product_id: string;

    @Column({ type: 'uuid' })
    size_id: string;

    @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
    price_adjustment: number;

    @ManyToOne('Product', 'productSizes', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @ManyToOne('Size', 'productSizes', { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'size_id' })
    size: Relation<Size>;
}
