import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Bridges')
export class Bridge {
  @PrimaryGeneratedColumn()
  BridgeId!: number;

  @Column()
  NameBridge!: string;
}