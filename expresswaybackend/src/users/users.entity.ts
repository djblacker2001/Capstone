import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from '../roles/roles.entity';

@Entity({ name: 'User', schema: 'dbo' })
export class User {
  @PrimaryGeneratedColumn({ name: 'UserId' })
  UserId!: number;

  @Column({ name: 'RoleId', type: 'int' })
  RoleId!: number;

  @Column({ name: 'Username', type: 'nvarchar', length: 100 })
  Username!: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 100 })
  Email!: string;

  @Column({ name: 'Password', type: 'nvarchar', length: 'MAX' })
  Password!: string;

  @Column({ name: 'Role', type: 'nvarchar', length: 20, default: 'user' })
  Role!: string;

  @Column({ name: 'IsActive', type: 'bit', default: false })
  IsActive!: boolean;

  @Column({ name: 'IsLocked', type: 'bit', default: false })
  IsLocked!: boolean;

  @Column({ name: 'ActiveCode', type: 'nvarchar', length: 100, nullable: true })
  ActiveCode?: string | null;

  @Column({ name: 'Avatar', type: 'nvarchar', length: 'MAX', nullable: true })
  Avatar?: string | null;

  @Column({ name: 'ResetToken', type: 'nvarchar', length: 'MAX', nullable: true })
  ResetToken?: string | null;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime', default: () => 'GETDATE()' })
  CreatedAt!: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'RoleId' })
  roleObject!: Role;
}