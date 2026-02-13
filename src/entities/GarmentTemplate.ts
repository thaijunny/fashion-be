import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('garment_templates')
export class GarmentTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 10, default: '👕' })
    icon: string;

    @Column({ type: 'int', default: 400 })
    width: number;

    @Column({ type: 'int', default: 500 })
    height: number;

    @Column({ type: 'varchar', length: 500 })
    front_image: string;

    @Column({ type: 'varchar', length: 500 })
    back_image: string;

    @Column({ type: 'jsonb' })
    front_design_area: { left: number; top: number; right: number; bottom: number };

    @Column({ type: 'jsonb' })
    back_design_area: { left: number; top: number; right: number; bottom: number };

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
