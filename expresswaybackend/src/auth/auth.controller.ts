import {Controller, Post, Body, Get, Query, UnauthorizedException, BadRequestException,} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('verify')
  async verify(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Mã xác nhận không được để trống');
    return this.authService.verify(code);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.Username,
      body.Password,
    );
    if (!user) {
      throw new UnauthorizedException(
        'Tài khoản hoặc mật khẩu không chính xác',
      );
    }
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return await this.authService.resetPassword(body.token, body.newPassword);
  }
}
