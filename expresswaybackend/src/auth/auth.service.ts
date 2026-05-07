import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);
        console.log('User tìm thấy:', user);
        if (!user) return null;

        // 🚩 QUAN TRỌNG: Kiểm tra tài khoản đã kích hoạt chưa
        if (!user.IsActive) {
            throw new UnauthorizedException('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.');
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        console.log('Mật khẩu khớp không:', isMatch);
        return isMatch ? user : null;
    }

    async register(data: any) {
        const exist = await this.usersService.findByUsername(data.Username);
        if (exist) throw new BadRequestException('Username đã tồn tại');

        const hashed = await bcrypt.hash(data.Password, 10);
        const activeCode = crypto.randomBytes(32).toString('hex');

        const user = await this.usersService.create({
            Username: data.Username,
            Email: data.Email,
            Password: hashed,
            RoleId: 2,
            Role: 'user',      
            IsActive: false,  
            IsLocked: false,     
            ActiveCode: activeCode,
            CreatedAt: new Date(),

        });

        // Link này trỏ về endpoint verify của backend
        const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;

        // Chạy ngầm việc gửi email để không làm chậm response đăng ký
        this.sendEmail(user.Email, verifyLink).catch(err => console.error('Email Error:', err));

        return { message: 'Đăng ký thành công, vui lòng kiểm tra email để kích hoạt tài khoản' };
    }

    async verify(code: string) {
        const user = await this.usersService.findByActiveCode(code);
        if (!user) {
            throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn');
        }

        user.IsActive = true;
        user.ActiveCode = null; // Xóa code sau khi dùng xong
        await this.usersService.save(user);

        return { message: 'Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập.' };
    }

    async sendEmail(to: string, link: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your_email@gmail.com', // Nên dùng biến môi trường process.env.EMAIL_USER
                pass: 'xxxx xxxx xxxx xxxx', // App Password của Google
            },
        });

        await transporter.sendMail({
            from: '"Expressway System" <your_email@gmail.com>',
            to,
            subject: 'Xác nhận tài khoản Expressway',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #4CAF50;">Chào mừng bạn!</h2>
                    <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản:</p>
                    <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Kích hoạt tài khoản</a>
                    <p>Nếu nút trên không hoạt động, hãy copy link này: ${link}</p>
                </div>
            `,
        });
    }

    async login(user: any) {
        const payload = { sub: user.UserId, username: user.Username, role: user.Role };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign({ sub: user.UserId }, { expiresIn: '7d' })
        };
    }
}