import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  // Khởi tạo transporter khi module bắt đầu
  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // dùng SSL
      auth: {
        user: 'hoangvu222001@gmail.com',
        pass: 'nfusjpuhfkhurlsf',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Kiểm tra kết nối transporter ngay khi chạy server
    this.transporter.verify((error) => {
      if (error) {
        console.error('Lỗi Transporter (Mail):', error.message);
      } else {
        console.log('Hệ thống Mail đã sẵn sàng!');
      }
    });
  }

  // 1. Kiểm tra đăng nhập (So sánh mật khẩu chữ thô)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (user && user.Password === pass) {
      const { Password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Đăng ký (Hỗ trợ chọn Role và Gửi mail xác thực)
  async register(data: any) {
    const exist = await this.usersService.findByUsername(data.Username);
    if (exist) throw new BadRequestException('Username đã tồn tại');

    // Tạo mã kích hoạt ngẫu nhiên
    const activeCode = crypto.randomBytes(32).toString('hex');

    // Xác định RoleId dựa trên Role gửi lên
    const role = data.Role || 'user';
    const roleId = role === 'admin' ? 1 : 2; // Giả sử 1 là Admin, 2 là User

    const user = await this.usersService.create({
      Username: data.Username,
      Email: data.Email,
      Password: data.Password,
      RoleId: roleId,      // Thêm dòng này để không bị NULL
      Role: role,
      IsActive: false,
      IsLocked: false,
      ActiveCode: activeCode,
      CreatedAt: new Date(),
    });

    // Tạo link kích hoạt
    const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;

    // Gửi mail (Chạy bất đồng bộ, không bắt user phải đợi mail gửi xong mới báo thành công)
    this.sendEmail(user.Email, verifyLink).catch((err) =>
      console.error('Lỗi khi gửi Email:', err),
    );

    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  // 3. API Kích hoạt tài khoản
  async verify(code: string) {
    const user = await this.usersService.findByActiveCode(code);
    if (!user) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn');
    }

    user.IsActive = true;
    user.ActiveCode = null; // Xóa code sau khi dùng
    await this.usersService.save(user);

    return {
      success: true,
      message: 'Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập.',
    };
  }

  // 4. Hàm gửi mail nội bộ
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

  // 5. Tạo Token khi đăng nhập thành công
  async login(user: any) {
    const payload = {
      sub: user.UserId,
      username: user.Username,
      role: user.Role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: user // Trả thêm thông tin user để Frontend lưu vào localStorage
    };
  }

  // 1. Gửi yêu cầu quên mật khẩu
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email); // Bạn cần viết hàm này trong UsersService
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Lưu token vào DB (Bạn cần thêm cột ResetToken vào bảng User)
    user.ResetToken = resetToken;
    await this.usersService.save(user);

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Gửi mail
    await this.sendEmailForgotPassword(user.Email, resetLink);

    return { success: true, message: 'Link đặt lại mật khẩu đã được gửi vào Email của bạn' };
  }

  // 2. Đặt lại mật khẩu mới
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token); // Viết hàm này trong UsersService
    if (!user) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }
    user.Password = newPassword;
    user.ResetToken = null;
    await this.usersService.save(user);

    return { success: true, message: 'Mật khẩu đã được cập nhật thành công' };
  }

  // 3. Hàm gửi mail riêng cho quên mật khẩu
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
}