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
            from: '"Expressway System" <email_cua_ban@gmail.com>',
            to: email,
            subject: 'Verify your account',
            html: `<h3>Welcome!</h3>
            <p>Please click the link below to activate your account:</p>
            <a href="${url}">${url}</a>`,
        };

        return await this.transporter.sendMail(mailOptions);
    }
}