import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/sections.entity';

@Entity('Expressway')
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

  @OneToMany(() => Section, (section) => section.expressway)
  section!: Section[];
}
