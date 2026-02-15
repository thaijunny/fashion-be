import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
    @PrimaryColumn({ type: 'varchar' })
    key: string;

    @Column('text')
    value: string;
}
