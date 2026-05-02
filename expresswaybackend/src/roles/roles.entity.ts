import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';


@Entity({ name: 'Role', schema: 'dbo' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'RoleId' })
  RoleId!: number;

  @Column({ name: 'RoleName', type: 'nvarchar', length: 100 })
  RoleName!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  Description?: string;

  // Quan hệ: Một Role có thể được gán cho nhiều User
  @OneToMany(() => User, (user) => user.roleObject)
  users!: User[];
}