import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Section } from '../sections/sections.entity';

@Entity({ name: 'RestStop', schema: 'dbo' })
export class RestStop {
  @PrimaryGeneratedColumn({ name: 'RestStopId' })
  RestStopId!: number;

  @Column({ name: 'SectionId', type: 'int' })
  SectionId!: number;

  @Column({ name: 'NameRestStop', type: 'nvarchar', length: 100 })
  NameRestStop!: string;

  @Column({ name: 'Location', type: 'nvarchar', length: 100, nullable: true })
  Location?: string;

  @Column({ name: 'Longitude', type: 'float' })
  Longitude?: number;

  @Column({ name: 'Latitude', type: 'float' })
  Latitude?: number;

  @Column({ name: 'HasPetrol', type: 'bit' })
  HasPetrol!: boolean;

  @Column({ name: 'HasFood', type: 'bit' })
  HasFood!: boolean;

  @Column({ name: 'HasToilet', type: 'bit' })
  HasToilet!: boolean;

  @Column({ name: 'Status', type: 'nvarchar', length: 50, nullable: true })
  Status?: string;

  @ManyToOne(() => Section, (section) => section.restStop)
  @JoinColumn({ name: 'SectionId' })
  section!: Section;
}