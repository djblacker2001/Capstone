import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'email_cua_ban@gmail.com',
                pass: 'ma_app_password_16_ky_tu',
            },
        });
    }

    async sendVerificationEmail(email: string, code: string) {
        const url = `http://localhost:8080/auth/verify?code=${code}`;
        const mailOptions = {
            from: '"Hệ Thống Cao Tốc" <email_cua_ban@gmail.com>',
            to: email,
            subject: 'Xác thực tài khoản của bạn',
            html: `<h3>Chào mừng bạn!</h3>
             <p>Vui lòng click vào link dưới đây để kích hoạt tài khoản:</p>
             <a href="${url}">${url}</a>`,
        };

        return await this.transporter.sendMail(mailOptions);
    }
}