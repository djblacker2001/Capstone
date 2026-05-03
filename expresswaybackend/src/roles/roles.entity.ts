import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';

@Entity({ name: 'Role', schema: 'dbo' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'RoleId' })
  RoleId!: number;

  @Column({ name: 'RoleName', type: 'nvarchar', length: 100 })
  RoleName!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  Description?: string;

  @OneToMany(() => User, (user) => user.roleObject)
  users!: User[];
}
