import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
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
      secure: true,
      auth: {
        user: 'hoangvu222001@gmail.com',
        pass: 'nfusjpuhfkhurlsf',
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    this.transporter.verify((error) => {
      if (error) {
        console.error('Lỗi Transporter (Mail):', error.message);
      } else {
        console.log('Hệ thống Mail đã sẵn sàng!');
      }
    });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    console.log('Mật khẩu người dùng nhập:', pass);
    console.log('Mật khẩu trong DB:', user.Password);
    let isMatch = false;
    // Kiểm tra xem mật khẩu hiện tại trong DB có phải là Bcrypt không
    const isHashed = user.Password.startsWith('$2b$') || user.Password.startsWith('$2a$');
    if (isHashed) {
      // So sánh kiểu Bcrypt
      isMatch = await bcrypt.compare(pass, user.Password);
      console.log('Kết quả so sánh Bcrypt:', isMatch);
    } else {
      // So sánh kiểu chữ thô (Plain text)
      isMatch = (user.Password === pass);
      console.log('Kết quả so sánh chữ thô:', isMatch);
      // NẾU KHỚP KIỂU THÔ -> TỰ ĐỘNG BĂM LẠI VÀ CẬP NHẬT DB
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(pass, salt);

        // Gọi hàm vừa viết ở bước 1 để lưu mật khẩu mới đã băm
        await this.usersService.updatePassword(user.UserId, newHashedPassword);
        console.log(`User ${username} đã được nâng cấp lên Bcrypt thành công!`);
      }
    }

    if (isMatch) {
      const { Password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Đăng ký (Hỗ trợ chọn Role và Gửi mail xác thực)
  async register(data: any) {
    const exist = await this.usersService.findByUsername(data.Username);
    if (exist) throw new BadRequestException('Username đã tồn tại');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.Password, salt);
    const activeCode = crypto.randomBytes(32).toString('hex');
    const roleId = data.Role === 'admin' ? 1 : 2;

    const user = await this.usersService.create({
      Username: data.Username,
      Email: data.Email,
      Password: hashedPassword,
      RoleId: roleId,
      Role: data.Role || 'user',
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
    if (!user) throw new BadRequestException('Mã không hợp lệ');

    user.IsActive = true;
    user.ActiveCode = null;
    await this.usersService.save(user);

    // Tạo Token ngay sau khi kích hoạt thành công
    const payload = { sub: user.UserId, username: user.Username, role: user.Role };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Kích hoạt thành công!',
      accessToken,
      user: { id: user.UserId, username: user.Username }
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
      user: user
    };
  }

  // 1. Gửi yêu cầu quên mật khẩu
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
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