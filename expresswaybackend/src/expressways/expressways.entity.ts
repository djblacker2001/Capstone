import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Section } from "../sections/sections.entity";

@Entity('Expressways')
export class Expressway {
  @PrimaryGeneratedColumn()
  ExpresswayId!: number;

  @Column()
  NameExpressway!: string;

  @Column({ nullable: true })
  Symbol!: string;

  @Column({ nullable: true })
  StartPoint!: string;

  @Column({ nullable: true })
  EndPoint!: string;

  @Column('decimal')
  TotalLength!: number;

  @OneToMany(() => Section, (section) => section.expressways)
  sections!: Section[];
}