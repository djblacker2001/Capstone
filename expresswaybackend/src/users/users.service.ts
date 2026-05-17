import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { LoginDto } from '../auth/dto/login.dto';
// XÓA: import { AuthService } from '../auth/auth.service'; <- Xóa dòng này để tránh lỗi vòng lặp

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

  async remove(id: number): Promise<any> {
    const userToDelete = await this.userRepository.findOne({ where: { UserId: id } });

    if (!userToDelete) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID bằng ${id}`);
    }

    if (userToDelete.Role === 'admin') {
      throw new BadRequestException('Hệ thống bảo mật: Bạn không được phép xóa tài khoản thuộc nhóm Quản trị viên (Admin)!');
    }

    await this.userRepository.delete({UserId: id});
    return {
      success: true,
      statusCode: 200,
      message: `Đã xóa thành công tài khoản người dùng: ${userToDelete.Username}`,
    };
  }

  async update(id: number, updateData: any): Promise<any> {
    await this.userRepository.update({ UserId: id }, updateData);
    return this.userRepository.findOneBy({ UserId: id });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ Email: email });
  }

  async findByResetToken(token: string) {
    return await this.userRepository.findOneBy({ ResetToken: token });
  }

  async updateAvatar(userId: number, avatarPath: string) {
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');

    user.Avatar = avatarPath;
    return this.userRepository.save(user);
  }

  async updatePassword(userId: number, newHashedPassword: string): Promise<void> {
    const result = await this.userRepository.update({ UserId: userId }, {
      Password: newHashedPassword
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID ${userId}`);
    }
  }
}