/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from '../sections/sections.entity';

@Entity({ name: 'Interchanges', schema: 'dbo' })
export class Interchange {
  @PrimaryGeneratedColumn({ name: 'InterchangeId' })
  InterchangeId!: number;

  @Column({ name: 'SectionId', type: 'int' })
  SectionId!: number;

  @Column({ name: 'NameInterchange', type: 'nvarchar', length: 100 })
  NameInterchange!: string;

  @Column({ name: 'Type', type: 'nvarchar', length: 100, nullable: true })
  Type?: string;

  @Column({ name: 'Location', type: 'nvarchar', length: 100, nullable: true })
  Location?: string;

  @Column({ name: 'BOT', type: 'nvarchar', length: 50, nullable: true })
  BOT?: string;

  @Column({ name: 'Connection', type: 'nvarchar', length: 100, nullable: true })
  Connection?: string;

  @Column({ name: 'Status', type: 'nvarchar', length: 50, nullable: true })
  Status?: string;

  @ManyToOne(() => Section, (section) => section.interchange)
  @JoinColumn({ name: 'SectionId' })
  section!: Section;
}