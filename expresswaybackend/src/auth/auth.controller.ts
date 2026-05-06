//auth.controller.ts
import { Controller, Post, Body, Res, Req, UnauthorizedException, Get, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(
            body.Username,
            body.Password
        );

        if (!user) {
            throw new UnauthorizedException('Sai tài khoản');
        }

        return this.authService.login(user);
    }

    // 👉 REFRESH TOKEN
    @Post('refresh')
    refresh(
        @Req() req,
        @Res({ passthrough: true }) res,
    ) {
        const token = req.cookies['refreshToken'];

        const newAccessToken = this.authService.generateAccessToken({
            UserId: 1,
            Role: 'admin',
        });

        return { accessToken: newAccessToken };
    }

    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Get('verify')
    async verify(@Query('code') code: string) {
        return this.authService.verify(code);
    }
}