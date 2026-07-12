import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      scope: ['email', 'profile'],
    });
  }
}

@Injectable()
export class GitHubAuthGuard extends AuthGuard('github') {
  constructor() {
    super({
      scope: ['user:email'],
    });
  }
}
