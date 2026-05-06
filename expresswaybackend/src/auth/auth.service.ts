// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);

        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return null;

        return user;
    }

    async login(user: any) {
        const payload = {
            sub: user.UserId,
            username: user.Username,
            role: user.Role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async register(data: any) {
        const exist = await this.usersService.findByUsername(data.Username);
        if (exist) throw new Error('Username đã tồn tại');

        const hashed = await bcrypt.hash(data.Password, 10);

        // 👉 tạo mã xác nhận
        const activeCode = crypto.randomBytes(32).toString('hex');

        const user = await this.usersService.create({
            Username: data.Username,
            Email: data.Email,
            Password: hashed,
            Role: 'user',
            IsActive: false, // ❗ chưa kích hoạt
            ActiveCode: activeCode,
        });

        // 👉 link verify
        const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;

        await this.sendEmail(user.Email, verifyLink);

        return {
            message: 'Đăng ký thành công, vui lòng kiểm tra email',
        };
    }

    async sendEmail(to: string, link: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your_email@gmail.com',
                pass: 'app_password', // ❗ dùng app password
            },
        });

        await transporter.sendMail({
            from: '"Expressway System" <your_email@gmail.com>',
            to,
            subject: 'Xác nhận tài khoản',
            html: `
            <h3>Click để kích hoạt tài khoản</h3>
            <a href="${link}">${link}</a>
        `,
        });
    }

    async verify(code: string) {
        const user = await this.usersService.findByActiveCode(code);

        if (!user) {
            throw new Error('Link không hợp lệ');
        }

        user.IsActive = true;
        user.ActiveCode = null;

        await this.usersService.save(user);

        return {
            message: 'Kích hoạt thành công, bạn có thể đăng nhập',
        };
    }

    generateAccessToken(user: any) {
        return this.jwtService.sign(
            {
                userId: user.UserId,
                role: user.Role,
            },
            { expiresIn: '15m' }
        );
    }

    generateRefreshToken(user: any) {
        return this.jwtService.sign(
            {
                userId: user.UserId,
            },
            { expiresIn: '7d' }
        );
    }
}