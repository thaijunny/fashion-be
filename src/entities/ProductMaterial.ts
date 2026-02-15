import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import type { Product } from './Product.js';
import { Material } from './Material.js';

@Entity('product_materials')
export class ProductMaterial {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    product_id: string;

    @Column({ type: 'uuid' })
    material_id: string;

    @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
    price_adjustment: number;

    @ManyToOne('Product', 'productMaterials', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @ManyToOne(() => Material, (m) => m.productMaterials, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'material_id' })
    material: Material;
}
