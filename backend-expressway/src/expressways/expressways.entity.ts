import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/sections.entity';
import { Dashboard } from '../dashboard/dashboard.entity';

@Entity('Expressway')
export class Expressway {
  @PrimaryGeneratedColumn()
  ExpresswayId!: number;

  @Column()
  NameExpressway!: string;

  @Column()
  Symbol!: string;

  @Column({ nullable: true })
  Description?: string;

  @Column({ nullable: true })
  Tag?: string;

  @Column({ nullable: true })
  MapData?: string;

  @OneToMany(() => Section, (section) => section.expressway)
  section!: Section[];

  @OneToMany(() => Dashboard, (dashboard) => dashboard.expressway)
  dashboard!: Dashboard[];
}
