import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findByActiveCode(code: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { ActiveCode: code },
    });
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
    });
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
    const savedUser = await this.userRepository.save(newUser);
    return this.findOne(savedUser.UserId);
  }

  async remove(id: number): Promise<any> {
    const userToDelete = await this.userRepository.findOne({ 
      where: { UserId: id } 
    });

    if (!userToDelete) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    
    if (userToDelete.RoleId === 1) { 
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

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ 
      where: { Email: email }, 
    });
  }

  async findByResetToken(token: string) {
    return await this.userRepository.findOne({ 
      where: { ResetToken: token }, 
    });
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
    const user = await this.userRepository.findOne({ 
      where: { UserId: userId },
    });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { lang: this.lang, args: { id: userId } })
      );
    }

    if (updateUserDto.RoleId && ![1, 2].includes(updateUserDto.RoleId)) {
      throw new BadRequestException(
        this.i18n.t('user.ROLE_INVALID', { lang: this.lang })
      );
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const updatedUser = await this.findOne(userId);
    const { Password, ...userWithoutPassword } = updatedUser;

    return {
      message: this.i18n.t('user.ROLE_UPDATE_SUCCESS', { lang: this.lang }),
      data: userWithoutPassword,
    };
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ 
      where: { UserId: userId },
    });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.ACCOUNT_NOT_FOUND', { lang: this.lang })
      );
    }

    const inputData = updateUserDto as any;
    const newUsername = inputData.Username || inputData.username;
    const newEmail = inputData.Email || inputData.email;

    if (newUsername && newUsername !== user.Username) {
      const isUsernameExist = await this.userRepository.findOne({
        where: { Username: newUsername }
      });
      if (isUsernameExist) {
        throw new BadRequestException(
          this.i18n.t('user.USERNAME_TAKEN', { lang: this.lang })
        );
      }
      user.Username = newUsername;
    }

    if (newEmail && newEmail.trim() !== "" && newEmail !== user.Email) {
      const isEmailExist = await this.userRepository.findOne({
        where: {
          Email: newEmail,
          UserId: Not(userId)
        }
      });

      if (isEmailExist) {
        throw new BadRequestException(
          this.i18n.t('user.EMAIL_TAKEN', { lang: this.lang })
        );
      }
      user.Email = newEmail;
    }

    if (inputData.Avatar || inputData.avatar) {
      user.Avatar = inputData.Avatar || inputData.avatar;
    }

    await this.userRepository.save(user);
    const updatedUser = await this.findOne(userId);
    const { Password, ResetToken, ActiveCode, ...result } = updatedUser;

    return {
      success: true,
      message: this.i18n.t('user.PROFILE_UPDATE_SUCCESS', { lang: this.lang }),
      data: result,
    };
  }

  async removeAvatar(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { UserId: userId },
    });
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
    await this.userRepository.save(user);
    
    const updatedUser = await this.findOne(userId);
    const { Password, ResetToken, ActiveCode, ...result } = updatedUser;
    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('user.AVATAR_DELETE_SUCCESS', { lang: this.lang }),
      data: result,
    };
  }

  async countAllActiveUsers(): Promise<number> {
    return await this.userRepository.count({
      where: { IsActive: true }
    });
  }

  async countUsersByMonth(): Promise<any[]> {
    const rawData = await this.userRepository
      .createQueryBuilder('user')
      .select("FORMAT(user.CreatedAt, 'yyyy-MM')", 'month')
      .addSelect('COUNT(user.UserId)', 'newUsers')
      .groupBy("FORMAT(user.CreatedAt, 'yyyy-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return rawData.map(item => ({
      month: item.month,
      newUsers: Number(item.newUsers),
    }));
  }
}