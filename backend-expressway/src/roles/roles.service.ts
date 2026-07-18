import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { RoleId: id } });
    if (!role) throw new NotFoundException(`Không tìm thấy Role ID ${id}`);
    return role;
  }

  create(data: Partial<Role>): Promise<Role> {
    const newRole = this.roleRepository.create(data);
    return this.roleRepository.save(newRole);
  }
}