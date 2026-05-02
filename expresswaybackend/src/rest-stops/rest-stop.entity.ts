import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Section } from '../sections/sections.entity';


@Entity({ name: 'RestStops', schema: 'dbo' })
export class RestStop {
  @PrimaryGeneratedColumn({ name: 'RestStopId' })
  RestStopId!: number;

  @Column({ name: 'SectionId', type: 'int' })
  SectionId!: number;

  @Column({ name: 'NameRestStop', type: 'nvarchar', length: 100 })
  NameRestStop!: string;

  @Column({ name: 'Location', type: 'nvarchar', length: 100, nullable: true })
  Location?: string;

  @Column({ name: 'Status', type: 'nvarchar', length: 50, nullable: true })
  Status?: string;

  @OneToOne(() => Section, (section) => section.restStop)
  @JoinColumn({ name: 'SectionId' })
  sections!: Section;
  
}