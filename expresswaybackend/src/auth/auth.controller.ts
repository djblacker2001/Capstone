import { Controller, Post, Body, Get, Query, UnauthorizedException, BadRequestException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService,
  ) { }

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('verify')
  async verify(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException(
        this.i18n.t('auth.CODE_REQUIRED', { lang: this.lang })
      );
    }
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
        this.i18n.t('auth.LOGIN_FAILED', { lang: this.lang })
      );
    }
    return this.authService.login(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    await this.authService.logout(token);
    return {
      success: true,
      message: this.i18n.t('auth.LOGOUT_SUCCESS', { lang: this.lang }),
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.userId; 
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
      throw new BadRequestException(
        this.i18n.t('auth.TOKEN_REQUIRED', { lang: this.lang })
      );
    }
    return await this.authService.resetPassword(token, resetPasswordDto);
  }
}