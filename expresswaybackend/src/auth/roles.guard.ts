import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }
    const requiredRoles = roles.map(role => role.toLowerCase());

    const userRole = user.Role ? user.Role.toLowerCase() : '';

    console.log('=== KIỂM TRA ROLES GUARD ===');
    console.log('Quyền API yêu cầu:', requiredRoles);
    console.log('Quyền của User hiện tại:', userRole);

    return requiredRoles.includes(userRole);
  }
}