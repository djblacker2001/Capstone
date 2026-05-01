import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expressway } from "../expressways/expressways.entity";

@Entity('Sections')
export class Section {
  @PrimaryGeneratedColumn()
  sectionId!: number;

  @Column()
  nameSection!: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  mapData!: string;

  @ManyToOne(() => Expressway)
  expressway!: Expressway;
}