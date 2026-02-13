import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string; // 'sticker', 'pattern', 'icon', 'shape', 'font'

  @Column({ type: 'text' })
  url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
