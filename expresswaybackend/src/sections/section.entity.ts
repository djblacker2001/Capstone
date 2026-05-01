import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Sections')
export class Section {
  @PrimaryGeneratedColumn()
  sectionId!: number;

  @Column()
  nameSection!: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  mapData!: string;
}