import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Sign', schema: 'dbo' })
export class Sign {
  @PrimaryGeneratedColumn({ name: 'SignId' })
  SignId!: number;

  @Column({ name: 'Symbol', type: 'nvarchar', length: 100 })
  Sympol!: string;

  @Column({ name: 'Image', type: 'nvarchar', length: 'MAX', nullable: true })
  Image?: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  Description?: string;
}