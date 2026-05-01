import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Bridges')
export class Bridge {
  @PrimaryGeneratedColumn()
  SignId!: number;

  @Column()
  NameSign!: string;
}