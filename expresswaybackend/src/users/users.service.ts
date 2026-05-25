import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UpdateUserDto } from './dto/update-users.dto';

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

    await this.userRepository.delete({ UserId: id });
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

  async updatePassword(userId: number, newHashedPassword: string): Promise<void> {
    const result = await this.userRepository.update({ UserId: userId }, {
      Password: newHashedPassword
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID ${userId}`);
    }
  }

  async changeUserRole(userId: number, updateUserDto: UpdateUserDto) {
    // 1. Tìm xem tài khoản cần nâng quyền có tồn tại trong DB không
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID bằng ${userId}`);
    }

    // 2. Kiểm tra tính hợp lệ của RoleId gửi lên (nếu cần)
    if (updateUserDto.RoleId && ![1, 2, 3].includes(updateUserDto.RoleId)) {
      throw new BadRequestException('Mã RoleId không hợp lệ trong hệ thống!');
    }

    // 3. Tiến hành cập nhật các trường được gửi từ DTO
    // Nếu trong DTO có RoleId và Role là 'admin', nó sẽ ghi đè lên giá trị cũ 'user'
    Object.assign(user, updateUserDto);

    // 4. Lưu lại vào Database
    const updatedUser = await this.userRepository.save(user);

    // 5. Trả về kết quả thông báo thành công (Bóc tách để bỏ Password đi)
    const { Password, ...userWithoutPassword } = updatedUser;

    return {
      message: 'Cập nhật quyền hạn người dùng thành công!',
      data: userWithoutPassword, // Trả về object đã được loại bỏ Password
    };
  }

  // src/users/users.service.ts

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    // 1. Tìm xem tài khoản người dùng có tồn tại trong hệ thống không
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản người dùng!`);
    }

    // 2. KIỂM TRA TRÙNG LẶP USERNAME (Nếu người dùng muốn đổi Username)
    if (updateUserDto.Username && updateUserDto.Username !== user.Username) {
      const isUsernameExist = await this.userRepository.findOne({
        where: { Username: updateUserDto.Username }
      });
      if (isUsernameExist) {
        throw new BadRequestException('Tên đăng nhập (Username) này đã có người sử dụng!');
      }
    }

    // 3. Tiến hành đè các dữ liệu mới (bao gồm cả Avatar nếu có) từ DTO lên thực thể cũ
    Object.assign(user, updateUserDto);

    // 4. Lưu dữ liệu thay đổi xuống Database
    const updatedUser = await this.userRepository.save(user);

    // 5. Bóc tách dữ liệu để ẩn mật khẩu và các token bảo mật đi trước khi trả về Client
    const { Password, ResetToken, ActiveCode, ...result } = updatedUser;

    return {
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      data: result,
    };
  }
}