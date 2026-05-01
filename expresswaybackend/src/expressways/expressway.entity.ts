import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Expressways')
export class Expressway {
  @PrimaryGeneratedColumn()
  expresswayId!: number;

  @Column()
  nameExpressway!: string;
}