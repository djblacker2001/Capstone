import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { SignType } from '../sign-type/sign-type.entity';

@Entity({ name: 'Sign', schema: 'dbo' })
export class Sign {
  @PrimaryGeneratedColumn({ name: 'SignId' })
  SignId!: number;

  @Column({ name: 'SignTypeId', type: 'int' })
  SignTypeId!: number;

  @Column({ name: 'Symbol', type: 'nvarchar', length: 100 })
  Symbol!: string;

  @Column({ name: 'Image', type: 'nvarchar', length: 'MAX', nullable: true })
  Image?: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  Description?: string;

  @ManyToOne(() => SignType, (signType) => signType.sign)
  @JoinColumn({ name: 'SignTypeId' })
  signType!: SignType;
}