import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private transporter!: nodemailer.Transporter;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'hoangvu222001@gmail.com',
        pass: 'nfusjpuhfkhurlsf',
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    this.transporter.verify((error) => {});
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    let isMatch = false;
    const isHashed = user.Password.startsWith('$2b$') || user.Password.startsWith('$2a$');
    if (isHashed) {
      isMatch = await bcrypt.compare(pass, user.Password);
    } else {
      isMatch = (user.Password === pass);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(pass, salt);
        await this.usersService.updatePassword(user.UserId, newHashedPassword);
      }
    }

    if (isMatch) {
      const { Password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(data: any) {
    const exist = await this.usersService.findByUsername(data.Username);
    if (exist) throw new BadRequestException('Username already exists.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.Password, salt);
    const activeCode = crypto.randomBytes(32).toString('hex');

    const isAdminRequest = data.Role === 'admin';
    const roleId = isAdminRequest ? 1 : 2;

    const user = await this.usersService.create({
      Username: data.Username,
      Email: data.Email,
      Password: hashedPassword,
      RoleId: roleId,
      Role: data.Role || 'user',
      IsActive: isAdminRequest ? false : true,
      IsLocked: false,
      ActiveCode: activeCode,
      CreatedAt: new Date(),
    });

    if (isAdminRequest) {
      const superAdminEmail = 'hoangvu222001@gmail.com';

      this.sendEmailToAdminForApproval(superAdminEmail, user).catch((err) =>
        console.error('Error sending Admin notification email:', err),
      );

      return {
        success: true,
        message: 'Admin registration request has been submitted! Please wait for the Supreme Admin to approve the system.',
      };
    } else {
      const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;
      this.sendEmail(user.Email, verifyLink).catch((err) =>
        console.error('Error sending activation email to User.:', err),
      );

      return {
        success: true,
        message: 'Registration successful! Please check your email to activate your account.',
      };
    }
  }

  async verify(code: string) {
    const user = await this.usersService.findByActiveCode(code);
    if (!user) throw new BadRequestException('Invalid code');

    user.IsActive = true;
    user.ActiveCode = null;
    await this.usersService.save(user);
    const payload = { sub: user.UserId, username: user.Username, role: user.Role };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Activation successful!',
      accessToken,
      user: { id: user.UserId, username: user.Username }
    };
  }

  async sendEmail(to: string, link: string) {
    await this.transporter.sendMail({
      from: '"Expressway System" <your_email@gmail.com>',
      to,
      subject: 'Confirm your Expressway account.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #2e7d32;">Welcome to the Expressway System!</h2>
          <p>You have successfully registered an account. Please click the button below to activate it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activate Now</a>
          </div>
          <p style="font-size: 12px; color: #777;">If the button doesn't work, copy this link: ${link}</p>
        </div>
      `,
    });
  }

  async login(user: any) {
    const payload = {
      sub: user.UserId,
      username: user.Username,
      role: user.Role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: user
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { Email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(Email);
    if (!user) {
      throw new BadRequestException('The email address does not exist in the system.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.ResetToken = resetToken;
    await this.usersService.save(user);

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await this.sendEmailForgotPassword(user.Email, resetLink);
    return { success: true, message: 'The password reset link has been sent to your email.' };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { newPassword } = resetPasswordDto;
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('The verification code is invalid or has expired.');
    }
    user.Password = newPassword;
    user.ResetToken = null;
    await this.usersService.save(user);

    return { success: true, message: 'Password has been successfully updated' };
  }

  async sendEmailForgotPassword(to: string, link: string) {
    await this.transporter.sendMail({
      from: '"Expressway System" <hoangvu222001@gmail.com>',
      to,
      subject: 'Reset password',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Password reset request</h3>
        <p>You have requested a password reset. Please click the button below:</p>
        <a href="${link}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset password</a>
        <p>Unless you specifically requested this, please disregard this email.</p>
      </div>
    `,
    });
  }

  async sendEmailToAdminForApproval(adminEmail: string, newUser: any) {
    await this.transporter.sendMail({
      from: '"Expressway System" <hoangvu222001@gmail.com>',
      to: adminEmail,
      subject: `[Yêu cầu cấp quyền] Tài khoản xin làm Admin: ${newUser.Username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">Yêu Cầu Cấp Quyền Hệ Thống</h2>
          <p>Chào Admin tối cao, hệ thống ghi nhận một người dùng muốn đăng ký tài khoản với quyền <strong>Admin</strong>:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; width: 40%;">ID Người Dùng:</td>
              <td style="padding: 8px; color: #d32f2f; font-weight: bold;">${newUser.UserId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tên Đăng Nhập:</td>
              <td style="padding: 8px;">${newUser.Username}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Email Liên Hệ:</td>
              <td style="padding: 8px;">${newUser.Email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Thời Gian Đăng Ký:</td>
              <td style="padding: 8px;">${new Date(newUser.CreatedAt).toLocaleString()}</td>
            </tr>
          </table>

          <p><strong>Hướng dẫn duyệt tác vụ:</strong></p>
          <p>Vui lòng đăng nhập tài khoản Admin của bạn trên Swagger UI, tìm tới API <code>PUT /users/${newUser.UserId}</code> và tiến hành truyền Body để cập nhật quyền chính thức cho thành viên này.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #888; text-align: center;">Đây là email tự động gửi từ hệ thống Capstone Expressway Backend.</p>
        </div>
      `,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('The user was not found in the system.');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.Password);
    if (!isMatch) {
      throw new BadRequestException('The old password is incorrect!');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException('The new password must not be the same as the old password!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      success: true,
      message: 'Password changed successfully! Please use your new password for your next login.',
    };
  }
}