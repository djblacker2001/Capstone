import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Expressway } from '../expressways/expressways.entity';
import { Bridge } from '../bridges/bridges.entity';
import { RestStop } from '../rest-stops/rest-stop.entity'
import { Interchange } from '../interchanges/interchanges.entity';
import { Tunnel } from '../tunnels/tunnels.entity';

@Entity({ name: 'Sections', schema: 'dbo' })
export class Section {
  @PrimaryGeneratedColumn({ name: 'SectionId' })
  SectionId!: number;

  @Column({ name: 'ExpresswayId', type: 'int' })
  ExpresswayId!: number;

  @Column({ name: 'NameSection', type: 'nvarchar', length: 100 })
  NameSection!: string;

  @Column({ name: 'Image', type: 'nvarchar', length: 'MAX', nullable: true })
  Image?: string;

  @Column({ name: 'Length', type: 'float' })
  Length!: number;

  @Column({ name: 'StartLocation', type: 'nvarchar', length: 100 })
  StartLocation!: string;

  @Column({ name: 'EndLocation', type: 'nvarchar', length: 100 })
  EndLocation!: string;

  @Column({ name: 'SpeedLimit', type: 'nvarchar', length: 'MAX', nullable: true })
  SpeedLimit?: string;

  @Column({ name: 'Status', type: 'nvarchar', length: 50, nullable: true })
  Status?: string;

  @Column({ name: 'MapData', type: 'nvarchar', length: 'MAX', nullable: true })
  MapData?: string;

  @ManyToOne(() => Expressway, (expressway) => expressway.sections)
  @OneToMany(() => Bridge, (bridge) => bridge.sections)
  bridges!: Bridge[]
  @OneToOne(() => RestStop, (restStop) => restStop.sections)
  restStop!: RestStop[]
  @OneToMany(() => Interchange, (interchange) => interchange.section)
  interchanges!: Interchange[];
  @OneToMany(() => Tunnel, (tunnel) => tunnel.section)
  tunnels!: Interchange[];

  @JoinColumn({ name: 'ExpresswayId' })
  expressways!: Expressway;
}