import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from '../sections/sections.entity';

@Entity({ name: 'Tunnel', schema: 'dbo' })
export class Tunnel {
  @PrimaryGeneratedColumn({ name: 'TunnelId' })
  TunnelId!: number;

  @Column({ name: 'SectionId', type: 'int' })
  SectionId!: number;

  @Column({ name: 'NameTunnel', type: 'nvarchar', length: 100 })
  NameTunnel!: string;

  @Column({ name: 'Length', type: 'float' })
  Length!: number;

  @Column({ name: 'Height', type: 'float' })
  Height!: number;

  @Column({ name: 'HasLighting', type: 'bit' })
  HasLighting!: boolean;

  @ManyToOne(() => Section, (section) => section.tunnel)
  @JoinColumn({ name: 'SectionId' })
  section!: Section;
}