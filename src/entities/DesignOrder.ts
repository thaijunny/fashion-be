import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Project } from './Project.js';
import { GarmentTemplate } from './GarmentTemplate.js';

@Entity('design_orders')
export class DesignOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid' })
    project_id: string;

    @Column({ type: 'uuid', nullable: true })
    garment_template_id: string;

    @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
    total_amount: number;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status: string; // pending → confirmed → printing → shipped → done → cancelled

    @Column({ type: 'varchar', length: 20, default: 'L' })
    garment_size: string;

    @Column({ type: 'varchar', length: 50, default: 'white' })
    garment_color: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    shipping_address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    full_name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Project, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => GarmentTemplate, { nullable: true })
    @JoinColumn({ name: 'garment_template_id' })
    garment_template: GarmentTemplate;
}
