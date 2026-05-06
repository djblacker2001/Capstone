//admin.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user; // 👈 lấy từ middleware / jwt

    if (!user) return false;

    return user.Role === 'admin';
  }
}