import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async sendVerificationEmail(email: string, code: string) {
        const url = `${backendUrl}/auth/verify?code=${code}`;

        const mailOptions = {
            from: `"Expressway System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your account - Expressway System',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0A9646;">Chào mừng bạn đến với Expressway System!</h2>
                <p>Vui lòng bấm vào liên kết dưới đây để kích hoạt tài khoản của bạn:</p>
                <p>
                <a href="${url}" style="background-color: #0A9646; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Kích hoạt tài khoản
            </a>
            </p>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">
            Hoặc sao chép đường dẫn sau vào trình duyệt: <br>
            <a href="${url}" style="color: #1890ff;">${url}</a>
            </p>
            </div>
        `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(` Email xác thực đã được gửi tới: ${email} | MessageID: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(` Gửi email tới ${email} thất bại:`, error);
            throw error;
        }
    }
}