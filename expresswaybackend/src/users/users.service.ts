import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findByActiveCode(code: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { ActiveCode: code } });
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { Username: username },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { UserId: id },
    });
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng ID ${id}`);
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(id: number, updateData: any): Promise<any> {
    await this.userRepository.update(id, updateData);
    return this.userRepository.findOneBy({ UserId: id });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ Email: email });
  }

  async findByResetToken(token: string) {
    return await this.userRepository.findOneBy({ ResetToken: token });
  }
}
