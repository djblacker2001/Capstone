import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UpdateUserDto } from './dto/update-users.dto';
import * as fs from 'fs';
import * as path from 'path';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) { }

  // Hàm helper rút gọn để lấy ngôn ngữ hiện tại của Request Context
  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

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
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async remove(id: number): Promise<any> {
    const userToDelete = await this.userRepository.findOne({ where: { UserId: id } });

    if (!userToDelete) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }

    if (userToDelete.Role === 'admin') {
      throw new BadRequestException(
        this.i18n.t('user.ADMIN_DELETE_DENIED', { lang: this.lang })
      );
    }

    await this.userRepository.delete({ UserId: id });
    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('user.DELETE_SUCCESS', { lang: this.lang, args: { username: userToDelete.Username } }),
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
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id: userId } })
      );
    }
  }

  async changeUserRole(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id: userId } })
      );
    }

    if (updateUserDto.RoleId && ![1, 2, 3].includes(updateUserDto.RoleId)) {
      throw new BadRequestException(
        this.i18n.t('user.ROLE_INVALID', { lang: this.lang })
      );
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    const { Password, ...userWithoutPassword } = updatedUser;

    return {
      message: this.i18n.t('user.ROLE_UPDATE_SUCCESS', { lang: this.lang }),
      data: userWithoutPassword,
    };
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.ACCOUNT_NOT_FOUND', { lang: this.lang })
      );
    }

    if (updateUserDto.Username && updateUserDto.Username !== user.Username) {
      const isUsernameExist = await this.userRepository.findOne({
        where: { Username: updateUserDto.Username }
      });
      if (isUsernameExist) {
        throw new BadRequestException(
          this.i18n.t('user.USERNAME_TAKEN', { lang: this.lang })
        );
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    const { Password, ResetToken, ActiveCode, ...result } = updatedUser;

    return {
      success: true,
      message: this.i18n.t('user.PROFILE_UPDATE_SUCCESS', { lang: this.lang }),
      data: result,
    };
  }

  async removeAvatar(userId: number) {
    const user = await this.userRepository.findOne({ where: { UserId: userId } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.ACCOUNT_NOT_FOUND', { lang: this.lang })
      );
    }

    if (user.Avatar) {
      try {
        const filePath = path.resolve(user.Avatar);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error when deleting old avatar file:', error);
        throw new InternalServerErrorException(
          this.i18n.t('user.AVATAR_DELETE_ERROR', { lang: this.lang })
        );
      }
    }

    user.Avatar = null;
    const updatedUser = await this.userRepository.save(user);
    const { Password, ResetToken, ActiveCode, ...result } = updatedUser;
    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('user.AVATAR_DELETE_SUCCESS', { lang: this.lang }),
      data: result,
    };
  }
}