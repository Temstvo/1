import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Не авторизован');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    return user.role === 'ADMIN';
  }
}
