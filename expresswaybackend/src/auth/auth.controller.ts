import {Controller, Post, Body, Get, Query, UnauthorizedException, BadRequestException, Req, UseGuards,} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id; 
    return await this.authService.changePassword(+userId, changePasswordDto);
  }

  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Reset token generated and email dispatched.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiQuery({ 
    name: 'token', 
    required: true, 
    description: 'The secret reset token extracted from the link sent to your email' 
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    if (!token) {
      throw new BadRequestException('Mã token xác nhận không được để trống!');
    }
    return await this.authService.resetPassword(token, resetPasswordDto);
  }
}
