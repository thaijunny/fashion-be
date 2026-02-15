import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import type { ProductColor } from './ProductColor.js';

@Entity('colors')
export class Color {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    hex_code: string;

    @OneToMany('ProductColor', 'color')
    productColors: Relation<ProductColor>[];
}
