import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthAppGuard } from './auth.guard';
import { JwtService } from './jwt/jwt.service';

@Module({
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthAppGuard,
    },
  ],
  exports: [JwtService],
})
export class AuthModule {}
