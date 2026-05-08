import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Section } from '../sections/sections.entity';

@Entity('Province')
export class Province {
  @PrimaryGeneratedColumn()
  ProvinceId!: number;

  @Column({ type: 'nvarchar', length: 100 })
  ProvinceName!: string;

  @Column({ type: 'nvarchar', length: 50 })
  Region!: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToMany(() => Section, (section) => section.province)
  section!: Section[];
}
