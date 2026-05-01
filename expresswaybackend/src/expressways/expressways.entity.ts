import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Expressways')
export class Expressway {
  @PrimaryGeneratedColumn()
  ExpresswayId!: number;

  @Column()
  NameExpressway!: string;

  @Column({ nullable: true })
  StartPoint!: string;

  @Column({ nullable: true })
  EndPoint!: string;
}