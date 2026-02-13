import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductMaterial } from './ProductMaterial.js';

@Entity('materials')
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @OneToMany(() => ProductMaterial, (pm) => pm.material)
    productMaterials: ProductMaterial[];
}
