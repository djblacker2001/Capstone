import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Expressway {
  @PrimaryGeneratedColumn()
  ExpresswayId!: number;

  @Column()
  Name!: string;

  @Column()
  StartPoint!: string;

  @Column()
  EndPoint!: string;

  @Column('float')
  TotalLength!: number;

  @Column({ nullable: true })
  Status?: string;
}
