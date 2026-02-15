import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import type { ProductMaterial } from './ProductMaterial.js';

@Entity('materials')
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @OneToMany('ProductMaterial', 'material')
    productMaterials: Relation<ProductMaterial>[];
}
