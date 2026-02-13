import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductSize } from './ProductSize.js';

@Entity('sizes')
export class Size {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    name: string;

    @Column({ type: 'jsonb', nullable: true })
    measurements: Record<string, any>;

    @OneToMany(() => ProductSize, (ps) => ps.size)
    productSizes: ProductSize[];
}
