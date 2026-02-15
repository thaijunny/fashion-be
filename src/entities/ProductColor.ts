import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Product } from './Product.js';
import { Color } from './Color.js';

@Entity('product_colors')
export class ProductColor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    product_id: string;

    @Column({ type: 'uuid' })
    color_id: string;

    @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
    price_adjustment: number;

    @ManyToOne(() => Product, (p) => p.productColors, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @ManyToOne(() => Color, (c) => c.productColors, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'color_id' })
    color: Color;
}
