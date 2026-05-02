import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from '../sections/sections.entity';


@Entity({ name: 'Bridges', schema: 'dbo' })
export class Bridge {
  @PrimaryGeneratedColumn({ name: 'BridgeId' })
  BridgeId!: number;

  @Column({ name: 'SectionId', type: 'int' })
  SectionId!: number;

  @Column({ name: 'NameBridge', type: 'nvarchar', length: 100 })
  NameBridge!: string;

  @Column({ name: 'Location', type: 'nvarchar', length: 100, nullable: true })
  Location?: string;

  @Column({ name: 'Length', type: 'float', nullable: true })
  Length?: number;

  @Column({ name: 'Type', type: 'nvarchar', length: 50, nullable: true })
  Type?: string;

  @ManyToOne(() => Section, (section) => section.bridges)
  @JoinColumn({ name: 'SectionId' })
  sections!: Section;
}