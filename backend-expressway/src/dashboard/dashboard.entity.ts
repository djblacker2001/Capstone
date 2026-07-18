import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Expressway } from '../expressways/expressways.entity';

@Entity('Dashboard')
export class Dashboard {
    @PrimaryGeneratedColumn({ name: 'RevenueId' })
    RevenueId!: number;

    @Column({ name: 'ExpresswayId' })
    ExpresswayId!: number;

    @Column({ name: 'Month', length: 50 })
    Month!: string;

    @Column({ name: 'VehicleCount', type: 'float' })
    VehicleCount!: number;

    @Column({ name: 'Revenue', type: 'float' })
    Revenue!: number;

    @Column({ name: 'Violate', type: 'float' })
    Violate!: number;

    @ManyToOne(() => Expressway, (expressway) => expressway.dashboard, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ExpresswayId' })
    expressway!: Expressway;
}