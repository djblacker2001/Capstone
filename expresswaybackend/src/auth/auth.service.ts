// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

        // nếu chưa dùng bcrypt thì so sánh trực tiếp
        if (user.Password !== password) return null;

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