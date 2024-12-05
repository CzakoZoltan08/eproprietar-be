import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  isTokenExpired(expires: string): boolean {
    try {
      // Check if the payload has an expiration date
      if (expires) {
        const currentTime = Math.floor(Date.now() / 1000);

        return currentTime >= Math.floor(new Date(expires).getTime() / 1000);
      }
      return false;
    } catch (error) {
      // If there is an error during the verification, the token is invalid
      return true;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authSuccessful = await super.canActivate(context);
    if (!authSuccessful) {
      // unsuccessful authentication return false
      return false;
    }
    // Auth is successful authentication, user is injected
    return true;
  }

  matchRoles = (requiredRoles: string[], role) => {
    return requiredRoles.findIndex((rr) => rr === role) >= 0;
  };
}
