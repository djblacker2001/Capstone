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

  // 2. Đăng ký (Hỗ trợ chọn Role và Gửi mail báo cho Admin phê duyệt)
  async register(data: any) {
    const exist = await this.usersService.findByUsername(data.Username);
    if (exist) throw new BadRequestException('Username đã tồn tại');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.Password, salt);
    const activeCode = crypto.randomBytes(32).toString('hex');
    
    // Mới đầu đăng ký, dù chọn admin hay user thì ép cứng RoleId = 2 (User thường) hoặc 3 tùy DB của bạn.
    // Ở đây mình cứ giữ nguyên logic chia role ban đầu của bạn nhưng trạng thái kích hoạt phụ thuộc admin:
    const isAdminRequest = data.Role === 'admin';
    const roleId = isAdminRequest ? 1 : 2; 

    const user = await this.usersService.create({
      Username: data.Username,
      Email: data.Email,
      Password: hashedPassword,
      RoleId: roleId,
      Role: data.Role || 'user',
      IsActive: isAdminRequest ? false : true, // Nếu đăng ký admin -> Chờ duyệt (false), user thường -> active luôn
      IsLocked: false,
      ActiveCode: activeCode,
      CreatedAt: new Date(),
    });

    // --- XỬ LÝ GỬI MAIL NỘI BỘ TRỰC TIẾP TẠI ĐÂY ---
    if (isAdminRequest) {
      // Trường hợp 1: Người dùng muốn đăng ký làm Admin -> GỬI MAIL CHO ADMIN TỐI CAO
      const superAdminEmail = 'hoangvu222001@gmail.com'; // Nhận luôn vào mail hệ thống của bạn
      
      this.sendEmailToAdminForApproval(superAdminEmail, user).catch((err) =>
        console.error('Lỗi khi gửi Email thông báo Admin:', err),
      );

      return {
        success: true,
        message: 'Yêu cầu đăng ký quyền Admin đã được gửi! Vui lòng đợi Admin tối cao phê duyệt hệ thống.',
      };
    } else {
      // Trường hợp 2: Đăng ký User thường -> Gửi link kích hoạt cho chính họ như cũ
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

  // API Kích hoạt tài khoản
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

  // Hàm gửi mail nội bộ
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

  // Tạo Token khi đăng nhập thành công
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

  // Gửi yêu cầu quên mật khẩu
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

  // Đặt lại mật khẩu mới
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }
    user.Password = newPassword;
    user.ResetToken = null;
    await this.usersService.save(user);

    return { success: true, message: 'Mật khẩu đã được cập nhật thành công' };
  }

  // Hàm gửi mail riêng cho quên mật khẩu
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

  // Hàm gửi mail nội bộ thông báo cho Admin tối cao duyệt thành viên
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
}