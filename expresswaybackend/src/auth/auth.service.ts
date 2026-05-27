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
    if (exist) throw new BadRequestException('Username đã tồn tại');

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
        console.error('Lỗi khi gửi Email thông báo Admin:', err),
      );

      return {
        success: true,
        message: 'Yêu cầu đăng ký quyền Admin đã được gửi! Vui lòng đợi Admin tối cao phê duyệt hệ thống.',
      };
    } else {
      const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;
      this.sendEmail(user.Email, verifyLink).catch((err) =>
        console.error('Lỗi khi gửi Email kích hoạt cho User:', err),
      );

      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
      };
    }
  }

  async verify(code: string) {
    const user = await this.usersService.findByActiveCode(code);
    if (!user) throw new BadRequestException('Mã không hợp lệ');

    user.IsActive = true;
    user.ActiveCode = null;
    await this.usersService.save(user);
    const payload = { sub: user.UserId, username: user.Username, role: user.Role };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Kích hoạt thành công!',
      accessToken,
      user: { id: user.UserId, username: user.Username }
    };
  }

  async sendEmail(to: string, link: string) {
    await this.transporter.sendMail({
      from: '"Hệ Thống Cao Tốc" <your_email@gmail.com>',
      to,
      subject: 'Xác nhận tài khoản Expressway',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #2e7d32;">Chào mừng bạn đến với Expressway System!</h2>
          <p>Bạn đã đăng ký tài khoản thành công. Vui lòng nhấn vào nút bên dưới để kích hoạt:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Kích Hoạt Ngay</a>
          </div>
          <p style="font-size: 12px; color: #777;">Nếu nút không hoạt động, copy link này: ${link}</p>
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
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.ResetToken = resetToken;
    await this.usersService.save(user);

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await this.sendEmailForgotPassword(user.Email, resetLink);
    return { success: true, message: 'Link đặt lại mật khẩu đã được gửi vào Email của bạn' };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { newPassword } = resetPasswordDto;
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }
    user.Password = newPassword;
    user.ResetToken = null;
    await this.usersService.save(user);

    return { success: true, message: 'Mật khẩu đã được cập nhật thành công' };
  }

  async sendEmailForgotPassword(to: string, link: string) {
    await this.transporter.sendMail({
      from: '"Hệ Thống Cao Tốc" <hoangvu222001@gmail.com>',
      to,
      subject: 'Đặt lại mật khẩu Expressway',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Yêu cầu đặt lại mật khẩu</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút bên dưới:</p>
        <a href="${link}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
      </div>
    `,
    });
  }

  async sendEmailToAdminForApproval(adminEmail: string, newUser: any) {
    await this.transporter.sendMail({
      from: '"Hệ Thống Cao Tốc" <hoangvu222001@gmail.com>',
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
      throw new BadRequestException('Không tìm thấy người dùng trong hệ thống');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.Password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác!');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      success: true,
      message: 'Thay đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.',
    };
  }
}