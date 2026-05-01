import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Bridges')
export class Bridge {
  @PrimaryGeneratedColumn()
  TunnelId!: number;

  @Column()
  NameTunnel!: string;
}