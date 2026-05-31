import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService implements OnModuleInit {
  private transporter!: nodemailer.Transporter;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private readonly i18n: I18nService,
  ) { }

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

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

    this.transporter.verify((error) => { });
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
    if (exist) {
      throw new BadRequestException(this.i18n.t('auth.USERNAME_EXIST', { lang: this.lang }));
    }

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
        message: this.i18n.t('auth.ADMIN_REG_SUCCESS', { lang: this.lang }),
      };
    } else {
      const verifyLink = `http://localhost:8080/auth/verify?code=${activeCode}`;
      this.sendEmail(user.Email, verifyLink).catch((err) =>
        console.error('Error sending activation email to User.:', err),
      );

      return {
        success: true,
        message: this.i18n.t('auth.USER_REG_SUCCESS', { lang: this.lang }),
      };
    }
  }

  async verify(code: string) {
    const user = await this.usersService.findByActiveCode(code);
    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CODE', { lang: this.lang }));
    }

    user.IsActive = true;
    user.ActiveCode = null;
    await this.usersService.save(user);
    const payload = { sub: user.UserId, username: user.Username, role: user.Role };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: this.i18n.t('auth.ACTIVATION_SUCCESS', { lang: this.lang }),
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
      message: this.i18n.t('auth.LOGIN_SUCCESS', { lang: this.lang }),
      accessToken: this.jwtService.sign(payload),
      user: user
    };
  }

  private tokenBlacklist: Set<string> = new Set();
  async logout(token: string) {
    this.tokenBlacklist.add(token);
    return {
      success: true,
      message: this.i18n.t('auth.LOGOUT_SUCCESS', { lang: this.lang }),
    };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { Email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(Email);
    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.EMAIL_NOT_FOUND', { lang: this.lang }));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.ResetToken = resetToken;
    await this.usersService.save(user);

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await this.sendEmailForgotPassword(user.Email, resetLink);
    return {
      success: true,
      message: this.i18n.t('auth.FORGOT_PASSWORD_SUCCESS', { lang: this.lang })
    };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { newPassword } = resetPasswordDto;
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CODE', { lang: this.lang }));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.Password = hashedPassword;
    user.ResetToken = null;
    await this.usersService.save(user);

    return {
      success: true,
      message: this.i18n.t('auth.RESET_PASSWORD_SUCCESS', { lang: this.lang })
    };
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
      subject: `[Permission Request] Account requesting to be Admin: ${newUser.Username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">System Permission Request</h2>
          <p>Dear Supreme Admin, the system has detected a user wishing to register an account with <strong>Admin</strong> privileges:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; width: 40%;">User ID:</td>
              <td style="padding: 8px; color: #d32f2f; font-weight: bold;">${newUser.UserId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Username:</td>
              <td style="padding: 8px;">${newUser.Username}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Email contact:</td>
              <td style="padding: 8px;">${newUser.Email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Registration Period:</td>
              <td style="padding: 8px;">${new Date(newUser.CreatedAt).toLocaleString()}</td>
            </tr>
          </table>

          <p><strong>Task browsing guide:</strong></p>
          <p>Please log in to your Admin account on Swagger UI., find the API <code>PUT /users/${newUser.UserId}</code> and pass the Body to update the official permissions for this member.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #888; text-align: center;">This is an automated email sent from the Capstone Expressway Backend system.</p>
        </div>
      `,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.USER_NOT_FOUND', { lang: this.lang }));
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.Password);
    if (!isMatch) {
      throw new BadRequestException(this.i18n.t('auth.OLD_PASSWORD_INCORRECT', { lang: this.lang }));
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(this.i18n.t('auth.PASSWORD_SAME', { lang: this.lang }));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      success: true,
      message: this.i18n.t('auth.CHANGE_PASSWORD_SUCCESS', { lang: this.lang }),
    };
  }
}